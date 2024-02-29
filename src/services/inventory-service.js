import kafkaClient, {
  TOPIC_NEW_ORDER,
  TOPIC_INVENTORY_EMPTY,
  TOPIC_NEW_LOGGING_ACTION,
} from "../lib/kafka-client.js";
import productInventory from "../db/inventory.js";

// the groupId must be unique. In case you have multiple instances of the inventory-service running it will ensure only one of them process that event. Which means, in case one of the instances is down it will automatically distribute to other instance of the group.
const consumer = kafkaClient.consumer({ groupId: "inventory-service-group" });
const producer = kafkaClient.producer();

const sendEventToNotifyProductInventoryIsEmpty = async (productId) => {
  // create a new event for inventory-empty-topic
  await producer.send({
    topic: TOPIC_INVENTORY_EMPTY,
    messages: [{ value: JSON.stringify({ productId }) }],
  });
  // create a new event for new-logging-action-topic
  await producer.send({
    topic: TOPIC_NEW_LOGGING_ACTION,
    messages: [
      {
        value: JSON.stringify({
          serviceName: "inventory-service",
          action: "inventory-empty",
        }),
      },
    ],
  });
};

const processAndValidateProductsInventory = async (products) => {
  for (const product of products) {
    const prodQuantity = productInventory.product(product.productId);
    const updatedProdQuantity = prodQuantity - product.quantity;

    // update product inventory
    productInventory.setProduct(product.productId, updatedProdQuantity);

    await producer.send({
      // create a new event for new-logging-action-topic
      topic: TOPIC_NEW_LOGGING_ACTION,
      messages: [
        {
          value: JSON.stringify({
            serviceName: "inventory-service",
            action: "inventory-updated",
          }),
        },
      ],
    });

    // validates if the inventory is below 100 items for each product
    if (updatedProdQuantity <= 100) {
      // notify that the product needs to be refilled and log action
      await sendEventToNotifyProductInventoryIsEmpty(product.productId);

      // refill product inventory
      productInventory.setProduct(product.productId, 109);
    }
  }
};

// Function Expression Immediately Invoked (IIFE): once this module is imported it will be listening/waiting for new events on new-order-topic forever
(async () => {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({
    topics: [TOPIC_NEW_ORDER],
    // get all events from the beginning
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      // destructure message value to get only the products from it
      const { products } = JSON.parse(message.value);

      await processAndValidateProductsInventory(products);
    },
  });
})();

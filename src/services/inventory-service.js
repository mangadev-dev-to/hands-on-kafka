import kafkaClient, {
  TOPIC_NEW_ORDER,
  TOPIC_INVENTORY_EMPTY,
  TOPIC_NEW_LOGGING_ACTION,
} from "../lib/kafka-client.js";
import productInventory from "../db/inventory.js";

const consumer = kafkaClient.consumer({ groupId: "inventory-service-group" });
const producer = kafkaClient.producer();

const sendEventToNotifyProductInventoryIsEmpty = async (productId) => {
  await producer.send({
    topic: TOPIC_INVENTORY_EMPTY,
    messages: [{ value: JSON.stringify({ productId }) }],
  });

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

    productInventory.setProduct(product.productId, updatedProdQuantity);

    await producer.send({
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

    if (updatedProdQuantity <= 100) {
      await sendEventToNotifyProductInventoryIsEmpty(product.productId);

      productInventory.setProduct(product.productId, 109);
    }
  }
};

(async () => {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topics: [TOPIC_NEW_ORDER],
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { products } = JSON.parse(message.value);

      await processAndValidateProductsInventory(products);
    },
  });
})();

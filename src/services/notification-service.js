import kafkaClient, {
  TOPIC_NEW_ORDER,
  TOPIC_INVENTORY_EMPTY,
} from "../lib/kafka-client.js";

const consumer = kafkaClient.consumer({
  groupId: "notification-service-group",
});

const notificationHandlers = {
  [TOPIC_INVENTORY_EMPTY]: ({ productId }) =>
    console.log(
      `\n### Notification Service ###\nProduct ${productId} needs to be refilled.`
    ),
  [TOPIC_NEW_ORDER]: ({ orderId, customerId }) =>
    console.log(
      `\n### Notification Service ###\nCongrats ${customerId}, your order ${orderId} has been approved!`
    ),
};

(async () => {
  await consumer.connect();

  await consumer.subscribe({
    topics: [TOPIC_NEW_ORDER, TOPIC_INVENTORY_EMPTY],
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      notificationHandlers[topic](JSON.parse(message.value));
    },
  });
})();

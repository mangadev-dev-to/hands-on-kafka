import kafkaClient, {
  TOPIC_NEW_ORDER,
  TOPIC_INVENTORY_EMPTY,
} from "../lib/kafka-client.js";

const consumer = kafkaClient.consumer({
  groupId: "notification-service-group",
});

// an object of functions by topics to be called whenever an event arrives from that specific topic
const funcByTopic = {
  [TOPIC_INVENTORY_EMPTY]: ({ productId }) =>
    console.log(
      `\n### Notification Service ###\nProduct ${productId} has to be REFILLED!`
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
      // dynamic call specific function by incoming event topic
      funcByTopic[topic](JSON.parse(message.value));
    },
  });
})();

import kafkaClient, { TOPIC_NEW_LOGGING_ACTION } from "../lib/kafka-client.js";

const consumer = kafkaClient.consumer({ groupId: "logging-service-group" });

(async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: [TOPIC_NEW_LOGGING_ACTION],
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { serviceName, action } = JSON.parse(message.value);

      console.log(
        `\n--> Logging Service <--\nserviceName: ${serviceName}\naction: ${action}`
      );
    },
  });
})();

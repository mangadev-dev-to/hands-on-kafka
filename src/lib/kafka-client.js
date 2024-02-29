import { Kafka } from "kafkajs";

const CLIENT_ID = "kafka-hands-on";
// this URL must point to your local Kafka that is configured in docker-compose.yml
const BROKERS_URL = ["localhost:29092"];

export const TOPIC_NEW_ORDER = "new-order-topic";
export const TOPIC_INVENTORY_EMPTY = "inventory-empty-topic";
export const TOPIC_NEW_LOGGING_ACTION = "new-logging-action-topic";

const kafkaClient = new Kafka({ clientId: CLIENT_ID, brokers: BROKERS_URL });

export default kafkaClient;

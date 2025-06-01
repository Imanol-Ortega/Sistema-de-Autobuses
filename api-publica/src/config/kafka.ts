import { Kafka } from "kafkajs"

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ["kafka1: 9092", "kafka2: 9092", "kafka3: 9092"]
})

const kafkaProducer = kafka.producer()


export { kafkaProducer }
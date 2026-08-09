import { Kafka, Partitioners } from 'kafkajs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

const kafkaHost = process.env.KAFKA_BROKER || 'localhost:9092';

const kafka = new Kafka({
  clientId: 'codearcade-backend',
  brokers: [kafkaHost],
  retry: {
    initialRetryTime: 500,
    retries: 15
  }
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});
const consumer = kafka.consumer({ groupId: 'backend-group' });
const admin = kafka.admin();

const pendingJobs = new Map();

let isConnected = false;

async function ensureTopicsExist() {
  try {
    await admin.connect();
    await admin.createTopics({
      topics: [
        { topic: 'code-execution', numPartitions: 1, replicationFactor: 1 },
        { topic: 'code-results', numPartitions: 1, replicationFactor: 1 }
      ],
      waitForLeaders: true
    });
    await admin.disconnect();
  } catch (err) {
    // Ignore error if topics already exist
  }
}

export async function initKafka(retriesLeft = 10, delay = 2000) {
  if (isConnected) return;
  try {
    await ensureTopicsExist();

    await producer.connect();
    console.log('Kafka Producer connected');

    await consumer.connect();
    await consumer.subscribe({ topic: 'code-results', fromBeginning: false });
    console.log('Kafka Consumer subscribed to code-results');

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const result = JSON.parse(message.value.toString());
          const { jobId } = result;

          if (pendingJobs.has(jobId)) {
            const { resolve, timer } = pendingJobs.get(jobId);
            clearTimeout(timer);
            pendingJobs.delete(jobId);
            resolve(result);
          }
        } catch (err) {
          console.error('Error processing Kafka code-results message:', err);
        }
      },
    });

    isConnected = true;
  } catch (error) {
    if (retriesLeft > 0) {
      console.log(`[Backend Kafka] Connecting to broker... retrying in ${delay / 1000}s (${retriesLeft} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return initKafka(retriesLeft - 1, delay);
    }
    console.error('Error connecting Kafka in Backend:', error.message);
  }
}

/**
 * Sends code execution job to Kafka and awaits verdict result
 */
export function executeCodeViaKafka(jobPayload, timeoutMs = 20000) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!isConnected) {
        await initKafka();
      }

      const jobId = crypto.randomUUID();
      const payload = { jobId, ...jobPayload };

      const timer = setTimeout(() => {
        if (pendingJobs.has(jobId)) {
          pendingJobs.delete(jobId);
          reject(new Error('Execution timed out while waiting for compiler via Kafka'));
        }
      }, timeoutMs);

      pendingJobs.set(jobId, { resolve, reject, timer });

      await producer.send({
        topic: 'code-execution',
        messages: [{ key: jobId, value: JSON.stringify(payload) }],
      });
    } catch (err) {
      reject(err);
    }
  });
}

export default {
  initKafka,
  executeCodeViaKafka
};

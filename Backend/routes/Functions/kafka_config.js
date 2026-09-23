import { Kafka, Partitioners, logLevel } from 'kafkajs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

// Kafka is optional: only enabled when KAFKA_BROKER is set. Otherwise (or if the
// broker is unreachable) executeCodeViaKafka rejects immediately and callers
// fall back to calling the compiler over HTTP.
const kafkaHost = process.env.KAFKA_BROKER;
const kafkaEnabled = !!kafkaHost;

const kafka = kafkaEnabled
  ? new Kafka({
      clientId: 'codearcade-backend',
      brokers: [kafkaHost],
      logLevel: logLevel.NOTHING, // we log our own concise messages; kafkajs is very noisy when the broker is down
      connectionTimeout: 3000,
      retry: {
        initialRetryTime: 500,
        retries: 2
      }
    })
  : null;

const producer = kafka && kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});
const consumer = kafka && kafka.consumer({ groupId: 'backend-group' });
const admin = kafka && kafka.admin();

if (kafka) {
  const markDown = () => { isConnected = false; };
  producer.on(producer.events.DISCONNECT, markDown);
  consumer.on(consumer.events.DISCONNECT, markDown);
  consumer.on(consumer.events.CRASH, markDown);
}

const pendingJobs = new Map();

let isConnected = false;
let initializing = null;

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

export function initKafka(retriesLeft = 2, delay = 2000) {
  if (!kafkaEnabled) {
    console.log('KAFKA_BROKER not set, running without Kafka (direct HTTP compiler mode)');
    return Promise.resolve();
  }
  if (isConnected) return Promise.resolve();
  if (!initializing) {
    initializing = connectKafka(retriesLeft, delay).finally(() => { initializing = null; });
  }
  return initializing;
}

async function connectKafka(retriesLeft, delay) {
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
      return connectKafka(retriesLeft - 1, delay);
    }
    console.warn('Kafka unavailable, falling back to direct HTTP compiler mode:', error.message);
  }
}

/**
 * Sends code execution job to Kafka and awaits verdict result
 */
export function executeCodeViaKafka(jobPayload, timeoutMs = 20000) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!kafkaEnabled) {
        return reject(new Error('Kafka is not configured'));
      }
      if (!isConnected) {
        // don't block the request on a dead broker; retry connecting in the background
        initKafka().catch(() => {});
        return reject(new Error('Kafka is not connected'));
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

      try {
        await producer.send({
          topic: 'code-execution',
          messages: [{ key: jobId, value: JSON.stringify(payload) }],
        });
      } catch (sendErr) {
        clearTimeout(timer);
        pendingJobs.delete(jobId);
        throw sendErr;
      }
    } catch (err) {
      reject(err);
    }
  });
}

export default {
  initKafka,
  executeCodeViaKafka
};

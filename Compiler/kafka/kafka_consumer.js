import { Kafka, Partitioners } from 'kafkajs';
import dotenv from 'dotenv';
import getfilepath from '../Help_Functions/getfilepath.js';
import runcode from '../Help_Functions/runcode.js';
import getinputpath from '../Help_Functions/getinputpath.js';

dotenv.config();

process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

const kafkaHost = process.env.KAFKA_BROKER || 'localhost:9092';

const kafka = new Kafka({
  clientId: 'codearcade-compiler',
  brokers: [kafkaHost],
  retry: {
    initialRetryTime: 500,
    retries: 15
  }
});

const consumer = kafka.consumer({ groupId: 'compiler-group' });
const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});
const admin = kafka.admin();

let isRunning = false;

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
    // Ignore if topics already exist
  }
}

export async function startKafkaConsumer(retriesLeft = 10, delay = 2000) {
  if (isRunning) return;

  try {
    await ensureTopicsExist();

    await producer.connect();
    console.log('Kafka Producer connected in Compiler');

    await consumer.connect();
    await consumer.subscribe({ topic: 'code-execution', fromBeginning: false });
    console.log('Kafka Consumer subscribed to code-execution in Compiler');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          const { jobId, language = 'cpp', code, inputs, mode = 'OJ' } = payload;

          console.log(`[Kafka Worker] Processing job ${jobId} (lang: ${language})`);

          if (!code) {
            await producer.send({
              topic: 'code-results',
              messages: [
                {
                  key: jobId,
                  value: JSON.stringify({ jobId, success: false, error: 'Send both Language and Code' })
                }
              ]
            });
            return;
          }

          let responsePayload;
          try {
            const filepath = getfilepath(language, code);
            const input_path = getinputpath(inputs);
            const verdict = await runcode(filepath, input_path, mode);

            if (verdict.error) {
              responsePayload = {
                jobId,
                success: false,
                verdict: verdict.output ? verdict.output.replace(/\r\n/g, '\n') : 'Execution failed',
                err: verdict.error,
                error: verdict.error
              };
            } else {
              responsePayload = {
                jobId,
                success: true,
                verdict: verdict.output ? verdict.output.replace(/\r\n/g, '\n') : 'No Output',
                err: 'No error',
                error: null
              };
            }
          } catch (err) {
            responsePayload = {
              jobId,
              success: false,
              error: err.error || err.message || 'Unknown compilation/execution error',
              err: err.error || err.message || 'Unknown compilation/execution error'
            };
          }

          await producer.send({
            topic: 'code-results',
            messages: [
              {
                key: jobId,
                value: JSON.stringify(responsePayload)
              }
            ]
          });
          console.log(`[Kafka Worker] Sent result for job ${jobId}`);

        } catch (error) {
          console.error('[Kafka Worker] Error handling message:', error);
        }
      }
    });

    isRunning = true;
  } catch (error) {
    if (retriesLeft > 0) {
      console.log(`[Compiler Kafka] Connecting to broker... retrying in ${delay / 1000}s (${retriesLeft} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return startKafkaConsumer(retriesLeft - 1, delay);
    }
    console.error('Error starting Kafka consumer in Compiler:', error.message);
  }
}

export default startKafkaConsumer;

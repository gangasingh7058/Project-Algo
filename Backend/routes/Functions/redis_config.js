import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Redis is optional: without REDIS_URL, or if the server is unreachable,
// every call below becomes a no-op and routes fall back to the database.
let client = null;

if (process.env.REDIS_URL) {
    client = createClient({
        url: process.env.REDIS_URL,
        socket: {
            // give up after a few attempts instead of retrying forever
            reconnectStrategy: (retries) => (retries >= 3 ? false : Math.min(retries * 500, 2000)),
        },
    });
    client.on('ready', () => console.log('connected to redis'));
    client.on('error', (err) => console.warn('Redis unavailable:', err.message));
    client.connect().catch((err) => {
        console.warn('Redis connection failed, continuing without cache:', err.message);
    });
} else {
    console.log('REDIS_URL not set, running without Redis cache');
}

const isReady = () => !!client && client.isReady;

const redisClient = {
    isReady,
    async get(key) {
        if (!isReady()) return null;
        try { return await client.get(key); } catch { return null; }
    },
    async set(key, value) {
        if (!isReady()) return null;
        try { return await client.set(key, value); } catch { return null; }
    },
    async expire(key, seconds) {
        if (!isReady()) return null;
        try { return await client.expire(key, seconds); } catch { return null; }
    },
    async del(key) {
        if (!isReady()) return null;
        try { return await client.del(key); } catch { return null; }
    },
};

export default redisClient;

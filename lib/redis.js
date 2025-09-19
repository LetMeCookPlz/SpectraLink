const redis = require('redis');
const RedisStore = require('connect-redis').default;

let redisClient = null;

if (process.env.REDIS_HOST) {
  try {
    redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:6379`
    });
    await redisClient.connect();
    console.log('Connected to Redis successfully');
  } catch (error) {
    console.error('Failed to connect to Redis on startup:', error);
    redisClient = null;
  }
} else {
  console.warn('REDIS_HOST not set. Cache will not be available.');
}

const CACHE_TTL = 60 * 60 * 24; // 24 hours

export async function getOrSetCache(key, callback) {
  if (!redisClient) {
    let [data] = await callback();
    return data;
  }
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
			return JSON.parse(cachedData);
		}
    const [freshData] = await callback();
    await redisClient.setEx(key, CACHE_TTL, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    console.error('Cache error:', error);
    return callback();
  }
}

export async function invalidateCache(key) {
  if (!redisClient) {
    return;
  }
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

export default redisClient;
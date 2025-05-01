const redis = require('redis');
const RedisStore = require('connect-redis').default;

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`
});
redisClient.connect();

const CACHE_TTL = 60 * 60 * 24; // 24 hours

export async function getOrSetCache(key, callback) {
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
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

export default redisClient;
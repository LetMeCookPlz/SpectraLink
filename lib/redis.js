const redis = require('redis');
const RedisStore = require('connect-redis').default;

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`
});
redisClient.connect();

export default redisClient;
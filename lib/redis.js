const redis = require('redis');
const RedisStore = require('connect-redis').default;

const redisClient = redis.createClient();
redisClient.connect();

export default redisClient;

export async function verifySession(sessionCookie) {
  if (!sessionCookie) return null;
  try {
    const session = await redisClient.hGetAll(sessionCookie.value);
    if (session && session.user_id) {
      return {
          user_id: session.user_id,
          email: session.email,
          user_type: session.user_type,
      };
    }
  } catch (error) {
    console.error('Error verifying session:', error);
  }
  return null;
}
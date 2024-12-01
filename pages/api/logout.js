import redis from '@/lib/redis';

export default async function handler(req, res) {
	const session_id = req.cookies.session_id;
  res.setHeader('Set-Cookie', 'session_id=; Max-Age=0; path=/');
	if (session_id) {
		try {
  	  await redis.del(session_id);
		} catch (error) {
  	  console.log('Error deleting session from Redis:', error);
  	}
	}
  return res.status(200).json({ message: 'Logged out successfully' });
}

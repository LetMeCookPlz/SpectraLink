import { serialize } from 'cookie';
import pool from '@/lib/db';
import redisClient, { verifySession } from '@/lib/redis';

export default async function handler(req, res) {
	const { user_id } = req.body;
	const session_id = req.cookies.session_id;
	let sessionData = null;
	try {
	if (session_id) {
	  sessionData = await verifySession({ name: 'session_id', value: session_id });
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	if (sessionData && sessionData.user_type == 'Admin') {
		await pool.query('DELETE FROM Users WHERE user_id = ?', [user_id]);
	}
	return res.status(200).json({ message: 'User deleted successfully' });
} catch (error) {
		console.error('User deletion error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
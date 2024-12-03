import { serialize } from 'cookie';
import pool from '@/lib/db';
import redisClient, { verifySession } from '@/lib/redis';

export default async function handler(req, res) {
	const { plan_id, name, price, volume, bandwidth } = req.body;
	const session_id = req.cookies.session_id;
	let sessionData = null;
	try {
	if (session_id) {
	  sessionData = await verifySession({ name: 'session_id', value: session_id });
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	if (sessionData && sessionData.user_type == 'Admin') {
		await pool.query('UPDATE Plans SET name = ?, price = ?, volume = ?, bandwidth = ? WHERE plan_id = ?', [name, price, volume, bandwidth, plan_id]);
	}
	return res.status(200).json({ message: 'Plan updated successfully' });
} catch (error) {
		console.error('Plan update error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
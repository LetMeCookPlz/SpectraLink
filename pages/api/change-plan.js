import { serialize } from 'cookie';
import pool from '@/lib/db';
import redisClient, { verifySession } from '@/lib/redis';

export default async function handler(req, res) {
	const {connection_id, plan_id } = req.body;
	const session_id = req.cookies.session_id;
	let sessionData = null;
	try {
	if (session_id) {
	  sessionData = await verifySession({ name: 'session_id', value: session_id });
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	if (sessionData) {
		await pool.query('UPDATE Connections SET plan_id = ?, status = 0 WHERE connection_id = ? AND user_id = ?', [plan_id, connection_id, sessionData.user_id]);
	}
	return res.status(200).json({ message: 'Plan changed successfully' });
} catch (error) {
		console.error('Transaction error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
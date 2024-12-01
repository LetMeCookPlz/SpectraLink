import { serialize } from 'cookie';
import pool from '@/lib/db';
import redisClient, { verifySession } from '@/lib/redis';

export default async function handler(req, res) {
	const { plan_id, address, connection_type } = req.body;
	const session_id = req.cookies.session_id;
	let sessionData = null;
	try {
	if (session_id) {
	  sessionData = await verifySession({ name: 'session_id', value: session_id });
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	if (sessionData) {
		await pool.query('INSERT INTO Connections (user_id, plan_id, address, connection_type) VALUES  (?, ?, ?, ?)', [sessionData.user_id, plan_id, address, connection_type]);
	}
	return res.status(200).json({ message: 'Plan changed successfully' });
} catch (error) {
		console.error('Could not create a new connection:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
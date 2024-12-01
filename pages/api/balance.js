import { serialize } from 'cookie';
import pool from '@/lib/db';
import redisClient, { verifySession } from '@/lib/redis';

export default async function handler(req, res) {
	const { sum, connection_id, plan_id } = req.body;
	const session_id = req.cookies.session_id;
	let sessionData = null;
	try {
	if (session_id) {
	  sessionData = await verifySession({ name: 'session_id', value: session_id });
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	if (sessionData) {
		const [result] = await pool.query('UPDATE Users SET balance = balance + ? WHERE user_id = ? AND balance + ? >= 0', [sum, sessionData.user_id, sum]);
		if (result.affectedRows == 0) {
			return res.status(409).json({ message: 'Insufficient funds' });
		} 
		await pool.query('INSERT INTO Transactions (user_id, sum) VALUES (?, ?)', [sessionData.user_id, sum]);
			if (sum < 0 && connection_id && plan_id) {
			const [planPrice] = await pool.query('SELECT price FROM Plans WHERE plan_id = ?', [plan_id]);
			if (planPrice[0].price == (sum * -1)) {
				await pool.query('UPDATE Connections SET plan_id = ?, status = 1 WHERE connection_id = ? AND user_id = ?', [plan_id, connection_id, sessionData.user_id]);
			}
		}
	}
	return res.status(200).json({ message: 'Transaction successful' });
} catch (error) {
		console.error('Transaction error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
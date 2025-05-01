import pool from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';
import redisClient from '@/lib/redis';

export default async function handler(req, res) {
	try {
		const { sum, connection_id, plan_id } = req.body;
		const session = await getServerSession(req, res, authOptions)
		const user = session.user;
		const [result] = await pool.query('UPDATE Users SET balance = balance + ? WHERE user_id = ? AND balance + ? >= 0', [sum, user.id, sum]);
		if (result.affectedRows == 0) {
			return res.status(409).json({ message: 'Insufficient funds' });
		}
		await pool.query('INSERT INTO Transactions (user_id, sum) VALUES (?, ?)', [user.id, sum]);
		if (sum < 0 && connection_id && plan_id) {
			let planPrice;
			const cachedPlans = await redisClient.get('plans');
  		if (cachedPlans) {
				const plans = JSON.parse(cachedPlans);
				planPrice = plans.find(p => p.plan_id === plan_id).price;
			}
			else [[{ price: planPrice }]] = await pool.query('SELECT price FROM Plans WHERE plan_id = ?', [plan_id]);
			if (planPrice == (sum * -1)) {
				await pool.query('UPDATE Connections SET plan_id = ?, status = 1 WHERE connection_id = ? AND user_id = ?', [plan_id, connection_id, user.id]);
			}
		}
		return res.status(200).json({ message: 'Transaction successful' });
	} catch (error) {
		console.error('Transaction error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
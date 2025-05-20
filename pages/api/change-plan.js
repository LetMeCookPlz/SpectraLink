import pool from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';

export default async function handler(req, res) {
	try {
		const session = await getServerSession(req, res, authOptions)
		const user = session.user;
		const {connection_id, plan_id } = req.body;
		await pool.query('UPDATE Connections SET plan_id = ?, status = 0 WHERE connection_id = ? AND user_id = ?', [plan_id, connection_id, user.id]);
		return res.status(200).json({ message: 'Plan changed successfully' });
	} catch (error) {
		console.error('Transaction error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
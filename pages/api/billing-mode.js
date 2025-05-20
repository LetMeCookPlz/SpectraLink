import pool from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';

export default async function handler(req, res) {
	try {
		const session = await getServerSession(req, res, authOptions)
		const user = session.user;
		const { connection_id, recurring_billing } = req.body;
		await pool.query('UPDATE Connections SET recurring_billing = ? WHERE connection_id = ? AND user_id = ?', [recurring_billing, connection_id, user.id]);
		return res.status(200).json({ message: 'Billing mode changed successfully' });
	} catch (error) {
		console.error('Billing mode change error: ', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
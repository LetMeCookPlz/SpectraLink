import pool from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';

export default async function handler(req, res) {
	try {
		let { sum } = req.body;
		sum = sum * 1;
		const session = await getServerSession(req, res, authOptions);
		const user = session.user;
		await pool.query(`
		START TRANSACTION;
		UPDATE Users SET balance = balance + ? WHERE user_id = ?;
		INSERT INTO Transactions (user_id, sum) VALUES (?, ?);
  	COMMIT;
		`, [sum, user.id, user.id, sum]);
		return res.status(200).json({ message: 'Transaction successful' });
	} catch (error) {
		console.error('Transaction error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
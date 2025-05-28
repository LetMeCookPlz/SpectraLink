import pool from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';

export default async function handler(req, res) {
	try {
		const session = await getServerSession(req, res, authOptions)
		let user = session.user;
		const { plan_id, address, connection_type } = req.body;
		await pool.query('INSERT INTO Connections (user_id, plan_id, address, connection_type) VALUES  (?, ?, ?, ?)', [user.id, plan_id, address, connection_type]);
		return res.status(200).json({ message: 'Connection created successfully' });
	} catch (error) {
		console.error('Could not create a new connection:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
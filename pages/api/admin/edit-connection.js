import pool from '@/lib/db';

export default async function handler(req, res) {
	const { connection_id, plan_id, address, connection_type, status, recurring_billing } = req.body;
	try {
		await pool.query('UPDATE Connections SET plan_id = ?, address = ?, connection_type = ?, status = ?, recurring_billing = ? WHERE connection_id = ?', [plan_id, address, connection_type, status, recurring_billing, connection_id]);
		return res.status(200).json({ message: 'Connection updated successfully' });
	} catch (error) {
		console.error('Connection update error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
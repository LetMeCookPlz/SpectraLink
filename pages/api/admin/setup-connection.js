import pool from '@/lib/db';

export default async function handler(req, res) {
	try {
		const { connection_id } = req.body;
		await pool.query(`UPDATE Connections SET status = 'Призупинене' WHERE connection_id = ?`, [connection_id]);
		return res.status(200).json({ message: 'Connection setup successful' });
	} catch (error) {
		console.error('Connection setup error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
import pool from '@/lib/db';

export default async function handler(req, res) {
	const { connection_id } = req.body;
	try {
		await pool.query('DELETE FROM Connections WHERE connection_id = ?', [connection_id]);
		return res.status(200).json({ message: 'Connection deleted successfully' });
	} catch (error) {
		console.error('Connection deletion error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
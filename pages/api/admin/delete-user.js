import pool from '@/lib/db';

export default async function handler(req, res) {
	const { user_id } = req.body;
	try {
		await pool.query('DELETE FROM Users WHERE user_id = ?', [user_id]);
		return res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('User deletion error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
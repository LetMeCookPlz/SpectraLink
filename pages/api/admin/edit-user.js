import pool from '@/lib/db';

export default async function handler(req, res) {
	const { user_id, PIB, email, balance, user_type } = req.body;
	try {
		await pool.query('UPDATE Users SET PIB = ?, email = ?, balance = ?, user_type = ? WHERE user_id = ?', [PIB, email, balance, user_type, user_id]);
		return res.status(200).json({ message: 'User updated successfully' });
	} catch (error) {
		console.error('User update error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
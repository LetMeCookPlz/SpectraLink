import pool from '@/lib/db';

export default async function handler(req, res) {
	try {
		const { name, price, volume, bandwidth } = req.body;
		await pool.query('INSERT INTO Plans (name, price, volume, bandwidth) VALUES (?, ?, ?, ?)', [name, price, volume, bandwidth]);
		return res.status(200).json({ message: 'Plan created successfully' });
	} catch (error) {
		console.error('Plan update error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
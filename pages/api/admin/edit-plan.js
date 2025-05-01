import pool from '@/lib/db';
import { invalidateCache } from '@/lib/redis';

export default async function handler(req, res) {
	const { plan_id, name, price, volume, bandwidth } = req.body;
	try {
		await pool.query('UPDATE Plans SET name = ?, price = ?, volume = ?, bandwidth = ? WHERE plan_id = ?', [name, price, volume, bandwidth, plan_id]);
		invalidateCache('plans');
		return res.status(200).json({ message: 'Plan updated successfully' });
	} catch (error) {
		console.error('Plan update error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
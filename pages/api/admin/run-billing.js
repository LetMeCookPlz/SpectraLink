import pool from '@/lib/db';

export default async function handler(req, res) {
	try {
		await pool.query(`
    ALTER EVENT monthly_billing ENABLE;
    ALTER EVENT monthly_billing 
    ON SCHEDULE AT CURRENT_TIMESTAMP;
  `);
		return res.status(200).json({ message: 'Billing successful' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Billing failed' });
	}
}
import pool from '@/lib/db';

export default async function handler(req, res) {
try {
  const [plans] = await pool.query('SELECT * FROM Plans');
  res.status(200).json(plans);
} catch (error) {
  console.error('Error fetching plans:', error);
  res.status(500).json({ message: 'Error fetching plans' });
}
}
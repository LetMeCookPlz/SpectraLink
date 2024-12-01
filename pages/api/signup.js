import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { serialize } from 'cookie';
import pool from '@/lib/db';
import redis from '@/lib/redis';

export default async function handler(req, res) {
const { email, PIB, password } = req.body;
try {
	const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
	if (users.length > 0) {
		return res.status(409).json({ message: 'Користувач з таким email вже існує' });
	}
	const hash = await bcrypt.hash(password, 1);
	await pool.query('INSERT INTO Users (PIB, email, password) VALUES (?, ?, ?)', [PIB, email, hash]);
	res.status(200).json({ message: 'User created successfully' });
} catch (error) {
	console.error('Error during signup:', error);
	res.status(500).json({ message: 'Error during signup' });
}
}
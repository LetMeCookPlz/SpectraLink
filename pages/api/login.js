import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { serialize } from 'cookie';
import pool from '@/lib/db';
import redis from '@/lib/redis';

export default async function handler(req, res) {
const { email, password } = req.body;
try {
  const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
  if (users.length === 0) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Неправильний email або пароль' });
  }
	const sessionID = `sess:${crypto.randomUUID()}`; 
  await redis.hSet(sessionID, {
		user_id: user.user_id,
		email: user.email,
		user_type: user.user_type,
	});
  res.setHeader('Set-Cookie', serialize('session_id', sessionID, {
		httpOnly: true,
		secure: false,
		maxAge: 86400, // 24 hours
		path: '/',
	}));
	res.status(200).json({ message: 'Login successful' });
} catch (error) {
  console.error('Error during log-in:', error);
  res.status(500).json({ message: 'Error during log-in' });
}
}
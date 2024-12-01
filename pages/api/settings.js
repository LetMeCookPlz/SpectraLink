import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import pool from '@/lib/db';
import redisClient, { verifySession } from '@/lib/redis';

export default async function handler(req, res) {
	const { newEmail, newPassword } = req.body;
	const session_id = req.cookies.session_id;
	let sessionData = null;
	try {
	if (session_id) {
	  sessionData = await verifySession({ name: 'session_id', value: session_id });
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	if (sessionData) {
		if (newEmail && newEmail != sessionData.email) {
			const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [newEmail]);
	 		if (users.length > 0) {
	    	return res.status(409).json({ message: 'A user with that email already exists' });
	  	} else {
				console.log(`[*] Changing ${sessionData.email} to ${newEmail}`)
				await pool.query('UPDATE Users SET email = ? WHERE user_id = ?', [newEmail, sessionData.user_id]); 
				await redisClient.hSet(session_id, 'email', newEmail);
				if (!newPassword) {
					res.status(200).json({ message: 'Settings updated successfully' });
				}
			}
		}
		if (newPassword) {
			const hash = await bcrypt.hash(newPassword, 1);
			await pool.query('UPDATE Users SET password = ? WHERE user_id = ?', [hash, sessionData.user_id]);
			res.status(200).json({ message: 'Settings updated successfully' });
		}
	}
} catch (error) {
		console.error('Error in updating user settings:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
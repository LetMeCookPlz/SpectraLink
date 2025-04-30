import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';

export default async function handler(req, res) {
	try {
		const { newEmail, newPassword } = req.body;
		const session = await getServerSession(req, res, authOptions)
		let user = session.user;
		if (newEmail && newEmail != user.email) {
			const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [newEmail]);
	 		if (users.length > 0) {
	    	return res.status(409).json({ message: 'A user with that email already exists' });
	  	} else {
				await pool.query('UPDATE Users SET email = ? WHERE user_id = ?', [newEmail, user.id]); 
				if (!newPassword) {
					res.status(200).json({ message: 'Settings updated successfully' });
				}
			}
		}
		if (newPassword) {
			const hash = await bcrypt.hash(newPassword, 1);
			await pool.query('UPDATE Users SET password = ? WHERE user_id = ?', [hash, user.id]);
			res.status(200).json({ message: 'Settings updated successfully' });
		}
	} catch (error) {
		console.error('Error in updating user settings:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
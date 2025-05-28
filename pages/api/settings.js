import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';
import { z } from 'zod';

const userSchema = z.object({
	newEmail: z.string().email('Введіть дійсний email'),
	newPassword: z.string().optional()
  .refine(pass => !pass || pass.length >= 8, {
    message: 'Пароль має містити щонайменше 8 символів'
  })
});

export default async function handler(req, res) {
	try {
		const validatedData = userSchema.parse(req.body);
		const { newEmail, newPassword } = validatedData;
		const session = await getServerSession(req, res, authOptions)
		let user = session.user;
		if (newEmail && newEmail != user.email) {
			const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [newEmail]);
	 		if (users.length > 0) {
	    	return res.status(409).json({ message: 'Користувач з таким email вже існує' });
	  	} else {
				await pool.query('UPDATE Users SET email = ? WHERE user_id = ?', [newEmail, user.id]); 
			}
		}
		if (newPassword) {
			const hash = await bcrypt.hash(newPassword, 1);
			await pool.query('UPDATE Users SET password = ? WHERE user_id = ?', [hash, user.id]);
		}
		return res.status(200).json({ message: 'User updated successfully' });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const validationError = error.errors[0];
			return res.status(400).json({ 
				message: validationError.message
			});
		}
		console.error('User update error:', error);
  	res.status(500).json({ message: 'Internal server error' });
	}
}
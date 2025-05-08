import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { z } from 'zod';

const userSchema = z.object({
	email: z.string().email('Введіть дійсний email'),
	PIB: z.string().transform(val => val.trim())
	.refine(val => val.length >= 3, {
		message: "Введіть дійсний ПІБ"
	}),
	password: z.string().min(8, 'Пароль має містити щонайменше 8 символів')
});

export default async function handler(req, res) {
	try {
		const validatedData = userSchema.parse(req.body);
    const { email, PIB, password } = validatedData;
		const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
		if (users.length > 0) {
			return res.status(409).json({ message: 'Користувач з таким email вже існує' });
		}
		const hash = await bcrypt.hash(password, 1);
		await pool.query('INSERT INTO Users (PIB, email, password) VALUES (?, ?, ?)', [PIB, email, hash]);
		return res.status(200).json({ message: 'Користувач успішно створений' });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const validationError = error.errors[0];
			return res.status(400).json({ 
				message: validationError.message
			});
		}
		console.error('Error during signup:', error);
		return res.status(500).json({ message: 'Помилка під час реєстрації' });
	}
}
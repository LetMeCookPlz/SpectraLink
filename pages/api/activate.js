import pool from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';

export default async function handler(req, res) {
	try {
		const { connection_id } = req.body;
		const session = await getServerSession(req, res, authOptions)
		const user = session.user;
		let [result] = await pool.query(`
		START TRANSACTION;
		SET @days_remaining := DAY(LAST_DAY(NOW())) - DAY(NOW()) + 1;
  	SET @prorated := (
  	  SELECT (p.price / DAY(LAST_DAY(NOW()))) * @days_remaining
  	  FROM Connections c
  	  JOIN Plans p ON c.plan_id = p.plan_id
  	  WHERE c.connection_id = ?
  	);

  	UPDATE Users u
  	JOIN Connections c ON u.user_id = c.user_id
  	JOIN Plans p ON c.plan_id = p.plan_id
  	SET 
  	  u.balance = u.balance - @prorated,
  	  c.status = 'Активне'
  	WHERE 
  	  c.connection_id = ?
  	  AND c.user_id = ?
  	  AND c.status = 'Призупинене'
  	  AND u.balance >= @prorated;

  	INSERT INTO Transactions (user_id, sum)
  	SELECT 
  	  c.user_id, 
  	  -@prorated
  	FROM Connections c
  	WHERE 
  	  c.connection_id = ?
  	  AND ROW_COUNT() > 0;

  	COMMIT;
		`, [connection_id, connection_id, user.id, connection_id]);
		if (result[4].affectedRows === 0) {
    	return res.status(403).json({ message: 'Activation failed: Insufficient funds or invalid connection'});
  	}
		return res.status(200).json({ message: 'Activation successful' });
	} catch (err) {
	  await pool.query('ROLLBACK');
		console.error(err);
    return res.status(500).json({ message: 'Activation failed'});
	}
}
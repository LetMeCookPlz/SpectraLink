'use server';

import pool from '@/lib/db';
import Connections from "@/app/components/connections"
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';

export default async function Component() {
  try {
		const session = await getServerSession(authOptions);
		const user = session.user;
    const [userBalance] = await pool.query('SELECT balance FROM Users WHERE user_id = ?', [user.id]);
    const [connections] = await pool.query('SELECT * FROM Connections WHERE user_id = ?', [user.id]);
    const [plans] = await pool.query('SELECT * FROM Plans');

    return (
      <Connections
        connections={connections}
        plans={plans}
        userBalance={userBalance[0].balance}
      />
    );
  } catch (error) {
    console.error('Error fetching connections:', error);
    return <p>There was an error fetching the connections.</p>;
  }
}

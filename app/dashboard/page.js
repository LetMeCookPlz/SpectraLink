'use server';

import pool from '@/lib/db';
import { verifySession } from '@/lib/redis';
import { cookies } from 'next/headers';
import Connections from "@/app/components/ui/connections"

export default async function Component() {
  const session_id = cookies().get('session_id');
  let sessionData = null;

  if (session_id) {
    sessionData = await verifySession(session_id);
  }

  try {
    const [userBalance] = await pool.query('SELECT balance FROM Users WHERE user_id = ?', [sessionData.user_id]);
    const [connections] = await pool.query('SELECT * FROM Connections WHERE user_id = ?', [sessionData.user_id]);
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

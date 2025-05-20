'use server';

import pool from '@/lib/db';
import { ConnectionsTable } from "@/app/components/connections-table"

export default async function Component() {
  try {
    const [connections] = await pool.query('SELECT * FROM Connections');
    const [plans] = await pool.query('SELECT plan_id, name FROM Plans');
    return (
      <ConnectionsTable 
			connectionsData={connections}
			plansData={plans}
			/>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return <p>There was an error fetching the data.</p>;
  }
}

'use server';

import pool from '@/lib/db';
import { PlansChart } from "@/app/components/plans-chart"
import { getOrSetCache } from "@/lib/redis";

export default async function Component() {
  try {
    const [connections] = await pool.query('SELECT * FROM Connections');
    const plans = await getOrSetCache('plans', async () => await pool.query('SELECT * FROM Plans'));
    return (
			<PlansChart connections={connections} plans={plans}/>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return <p>There was an error fetching the data.</p>;
  }
}

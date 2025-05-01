'use server'

import pool from '@/lib/db';
import { PlansTable } from "@/app/components/plans-table"
import { getOrSetCache } from "@/lib/redis";

export default async function Component() {
  try {
    const plans = await getOrSetCache('plans', async () => await pool.query('SELECT * FROM Plans'));
    return (
      <PlansTable plansData={plans}/>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return <p>There was an error fetching the data.</p>;
  }
}

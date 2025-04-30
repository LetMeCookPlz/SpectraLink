'use server'

import pool from '@/lib/db';
import { PlansTable } from "@/app/components/plans-table"

export default async function Component() {
  try {
    const [plans] = await pool.query('SELECT * FROM Plans');
    return (
      <PlansTable plansData={plans}/>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return <p>There was an error fetching the data.</p>;
  }
}

'use server';

import pool from '@/lib/db';
import { TransactionsTable } from "@/app/components/transactions-table"

export default async function Component() {
  try {
    const [transactions] = await pool.query('SELECT * FROM Transactions');
    return (
      <TransactionsTable transactionsData={transactions}/>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return <p>There was an error fetching the data.</p>;
  }
}

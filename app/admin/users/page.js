'use server';

import pool from '@/lib/db';
import { UsersTable } from "@/app/components/users-table"

export default async function Component() {
  try {
    const [users] = await pool.query('SELECT * FROM Users');
    return (
      <UsersTable usersData={users}/>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return <p>There was an error fetching the data.</p>;
  }
}

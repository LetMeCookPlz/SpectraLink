'use server'

import pool from '@/lib/db';
import { verifySession } from '@/lib/redis';
import { cookies } from 'next/headers';
import { PlansTable } from "@/app/components/plans-table"

export default async function Component() {
  const session_id = cookies().get('session_id');
  let sessionData = null;

  if (session_id) {
    sessionData = await verifySession(session_id);
  }

	if (sessionData && sessionData.user_type != 'Customer') {
  	try {
  	  const [plans] = await pool.query('SELECT * FROM Plans');
			console.log(plans);
  	  return (
  	    <PlansTable plansData={plans}/>
  	  );
  	} catch (error) {
  	  console.error('Error fetching data:', error);
  	  return <p>There was an error fetching the data.</p>;
  	}
	} else {
		return <p>Unauthorized</p>;
	}
}

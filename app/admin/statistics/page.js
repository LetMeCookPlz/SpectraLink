'use server';

import pool from '@/lib/db';
import { verifySession } from '@/lib/redis';
import { cookies } from 'next/headers';
import { PlansChart } from "@/app/components/plans-chart"

export default async function Component() {
  const session_id = cookies().get('session_id');
  let sessionData = null;

  if (session_id) {
    sessionData = await verifySession(session_id);
  }

	if (sessionData && sessionData.user_type != 'Customer') {
  	try {
  	  const [connections] = await pool.query('SELECT * FROM Connections');
  	  const [plans] = await pool.query('SELECT * FROM Plans');
			console.log(connections, plans);
  	  return (
				<PlansChart connections={connections} plans={plans}/>
  	  );
  	} catch (error) {
  	  console.error('Error fetching data:', error);
  	  return <p>There was an error fetching the data.</p>;
  	}
	} else {
		return <p>Unauthorized</p>;
	}
}

'use server'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import pool from '@/lib/db';
import Details from '@/app/components/details'; 

export default async function Component() {
  try {
    const [plans] = await pool.query('SELECT * FROM Plans');
    
    return (
      <div className="flex flex-wrap items-center justify-center min-h-screen bg-background text-center">
        {plans.map((plan) => (
          <Card key={plan.plan_id} className="w-full max-w-sm m-10">
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="outline outline-1 outline-secondary rounded-full text-lg">
                Bandwidth: {plan.bandwidth} Mb/s
              </p>
              <p className="outline outline-1 outline-secondary rounded-full text-lg">
                Volume: {plan.volume} GB / month
              </p>
              <p className="outline outline-1 outline-secondary rounded-full text-lg">
                Monthly price: ${plan.price}
              </p>
            </CardContent>
            <CardFooter>
              <Details plan={plan} />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error fetching plans:', error);
    return <p>There was an error fetching the traffic plans.</p>;
  }
}

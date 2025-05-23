'use server'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import pool from '@/lib/db';
import Details from '@/app/components/details'; 
import { getOrSetCache } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth].js';

export default async function Component() {
  try {
		const session = await getServerSession(authOptions);
		let loggedIn = false;
		if (session) loggedIn = true;
		const plans = await getOrSetCache('plans', async () => await pool.query('SELECT * FROM Plans'));
    return (
      <div className="flex flex-wrap items-center justify-center min-h-screen bg-background text-center">
        {plans.map((plan) => (
          <Card key={plan.plan_id} className="w-full max-w-sm m-10">
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="outline outline-1 outline-secondary rounded-full text-lg">
                Швидкість: {plan.bandwidth} Мб/с
              </p>
              <p className="outline outline-1 outline-secondary rounded-full text-lg">
                Об'єм: {plan.volume} ГБ / місяць
              </p>
              <p className="outline outline-1 outline-secondary rounded-full text-lg">
                Ціна: {plan.price} ₴ / місяць
              </p>
            </CardContent>
            <CardFooter>
              <Details plan={plan} loggedIn={loggedIn} />
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

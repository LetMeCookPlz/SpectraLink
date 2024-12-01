'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import BalanceCard from "@/app/components/balance-card";

export default function Connections({ connections, plans, userBalance }) {
  const [localConnections, setLocalConnections] = useState(connections);
  const [balance, setBalance] = useState(userBalance);
  const [amount, setAmount] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changingConnectionId, setChangingConnectionId] = useState(null);

  const handleAddBalance = async (e) => {
    e.preventDefault();
    setBalance((prevBalance) => prevBalance + amount);
    const sum = amount;
    setAmount(0);
    try {
      await fetch("/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sum }),
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const activateConnection = async (sum, connection_id, plan_id) => {
    try {
      const response = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sum, connection_id, plan_id }),
      });
      const data = await response.json();
      if (response.ok) {
        setLocalConnections((prevConnections) =>
          prevConnections.map((connection) =>
            connection.connection_id === connection_id
              ? { ...connection, status: 1 }
              : connection
          )
        );
        setBalance((prevBalance) => prevBalance + sum);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error activating connection:', error);
      alert('An unexpected error occurred.');
    }
  };

  const handleChangePlan = async () => {
    try {
      const response = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: changingConnectionId, plan_id: selectedPlanId }),
      });

      if (response.ok) {
        setLocalConnections((prevConnections) =>
          prevConnections.map((connection) =>
            connection.connection_id === changingConnectionId
              ? { ...connection, plan_id: selectedPlanId, status: 0 }
              : connection
          )
        );
      } else {
        alert('Error changing plan.');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      alert('An unexpected error occurred.');
    } finally {
      setDialogOpen(false);
    }
  };

  const planMap = plans.reduce((map, plan) => {
    map[plan.plan_id] = { name: plan.name, price: plan.price };
    return map;
  }, {});

  return (
    <div className='pt-16'>
      <Card className="w-full max-w-md mx-auto bg-transparent border-transparent mt-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Ваш баланс</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-4xl font-bold text-center" aria-live="polite">
            ${balance.toFixed(2)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Додати фінанси</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <Slider
              value={[amount]}
              onValueChange={(value) => setAmount(value[0])}
              max={1000}
              step={1}
              className="w-full h-4"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleAddBalance}
            disabled={amount <= 0}
          >
            Поповнити баланс на ${amount.toFixed(2)}
          </Button>
        </CardFooter>
      </Card>
      <div className="flex flex-wrap items-center justify-center min-h-screen bg-background text-center mt-[-200px]">
        {localConnections.map((connection) => {
          const plan = planMap[connection.plan_id];
          const activationPrice = plan.price;

          return (
            <Card key={connection.id} className="w-full max-w-sm m-10">
              <CardHeader>
                <CardTitle className="text-xl">{connection.address}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
							<p className="outline outline-2 outline-secondary rounded-full text-lg text-center h-[2.5rem] flex items-center justify-center">
                  Тип підключення: {connection.connection_type}
                </p>
                <Select
                  value={connection.plan_id.toString()}
                  onValueChange={(value) => {
                    setSelectedPlanId(parseInt(value));
                    setChangingConnectionId(connection.connection_id);
                    setDialogOpen(true);
                  }}
                >
                  <SelectTrigger className="outline outline-1 outline-secondary rounded-full text-lg text-center flex items-center justify-center h-[2.5rem]">
                    Тарифний план: {plan.name}
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.plan_id} value={plan.plan_id.toString()}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="outline outline-2 outline-secondary rounded-full text-lg text-center h-[2.5rem] flex items-center justify-center">
                  Статус: {connection.status === 1 ? 'Активований' : 'Не активаний'}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full rounded-full"
                  onClick={() =>
                    activateConnection(
                      activationPrice * -1,
                      connection.connection_id,
                      connection.plan_id
                    )
                  }
                  disabled={
                    connection.status === 1 || balance < activationPrice
                  }
                >
                  {connection.status === 1
                    ? 'Активований'
                    : `Activate ($${activationPrice.toFixed(2)})`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Зміна тарифного плану
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p>Чи точно ви хочете змінити тарифний план? Ви будете повинні оплатити послугу по її новій ціні.</p>
          <AlertDialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="secondary">
              Відмінити
            </Button>
            <Button onClick={handleChangePlan}>Підтвердити</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

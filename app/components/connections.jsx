'use client';

import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Connections({ connections, plans, userBalance }) {
  const [localConnections, setLocalConnections] = useState(connections);
  const [balance, setBalance] = useState(Number(userBalance));
  const [amount, setAmount] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [changingConnectionId, setChangingConnectionId] = useState(null);
  const [proratedPrices, setProratedPrices] = useState({});
	const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

	const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  if (parts.length) {
    return parts.join(' ');
  }
  return value;
};

const formatExpiryDate = (value) => {
  const v = value.replace(/[^0-9]/g, '');
  if (v.length >= 3) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  return value;
};

const handleCardNumberChange = (e) => {
  const formatted = formatCardNumber(e.target.value);
  setCardDetails({...cardDetails, number: formatted});
};

const handleExpiryChange = (e) => {
  const formatted = formatExpiryDate(e.target.value);
  setCardDetails({...cardDetails, expiry: formatted});
};

const handleCvvChange = (e) => {
  const v = e.target.value.replace(/[^0-9]/g, '');
  setCardDetails({...cardDetails, cvv: v.substring(0, 3)});
};

const isFormValid = () => {
  return (
    cardDetails.number.replace(/\s/g, '').length === 16 &&
    cardDetails.expiry.length === 5 &&
    cardDetails.cvv.length === 3 &&
    amount > 0
  );
};

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - currentDay + 1;

    const prices = {};
    plans.forEach(plan => {
      prices[plan.plan_id] = (plan.price / daysInMonth * remainingDays).toFixed(2);
    });
    setProratedPrices(prices);
  }, [plans]);

   const handleAddBalance = async (e) => {
    e.preventDefault();
    setCardDialogOpen(true);
  };

  const handleCardSubmit = async () => {
    try {
      setBalance((prevBalance) => prevBalance + amount);
      const sum = amount;
      setAmount(0);
      setCardDialogOpen(false);
      await fetch("/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sum }),
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const activateConnection = async (connection_id, plan_id) => {
    const price = parseFloat(proratedPrices[plan_id]);
    try {
      const response = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id }),
      });
      const data = await response.json();
      if (response.ok) {
        setLocalConnections((prevConnections) =>
          prevConnections.map((connection) =>
            connection.connection_id === connection_id
              ? { ...connection, status: 'Активне' }
              : connection
          )
        );
        setBalance((prevBalance) => prevBalance - price);
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
        body: JSON.stringify({ 
          connection_id: changingConnectionId, 
          plan_id: selectedPlanId
        }),
      });

      if (response.ok) {
        setLocalConnections((prevConnections) =>
          prevConnections.map((connection) =>
            connection.connection_id === changingConnectionId
              ? { ...connection, plan_id: selectedPlanId, status: "Призупинене" }
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
      setPlanDialogOpen(false);
    }
  };

  const handleRecurringBillingChange = async (connection_id, newStatus) => {
    try {
      const response = await fetch('/api/billing-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          connection_id,
          recurring_billing: newStatus
        }),
      });

      if (response.ok) {
        setLocalConnections((prevConnections) =>
          prevConnections.map((connection) =>
            connection.connection_id === connection_id
              ? { ...connection, recurring_billing: newStatus }
              : connection
          )
        );
      } else {
        alert('Error updating recurring billing mode.');
      }
    } catch (error) {
      console.error('Error updating billing mode:', error);
      alert('An unexpected error occurred.');
    }
  };

  const planMap = plans.reduce((map, plan) => {
    map[plan.plan_id] = { 
      name: plan.name, 
      monthly_price: plan.price,
      prorated_price: proratedPrices[plan.plan_id] || plan.price.toFixed(2)
    };
    return map;
  }, {});

  return (
    <div className='pt-16'>
      <Card className="w-full max-w-md mx-auto bg-transparent border-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Ваш баланс</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-center" aria-live="polite">
            {balance.toFixed(2)} ₴
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Додати фінанси</span>
              <span>{amount.toFixed(2)} ₴</span>
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
            Поповнити баланс на {amount.toFixed(2)} ₴
          </Button>
        </CardFooter>
      </Card>

			{localConnections.length === 0 && (
			  <div className="flex flex-col items-center justify-center min-h-[10vh] gap-4">
			    <p className="text-xl text-muted-foreground">
			      У вас ще немає оформлених підключень
			    </p>
			    <Button asChild>
			      <a href="/plans">Підключитися</a>
			    </Button>
			  </div>
			)}

      <div className="flex flex-wrap items-center justify-center min-h-screen bg-background text-center mt-[-170px]">
        {localConnections.map((connection) => {
          const plan = planMap[connection.plan_id];
          const activationPrice = parseFloat(plan.prorated_price);

          return (
            <Card key={connection.id} className="w-full max-w-sm m-10">
              <CardHeader>
                <CardTitle className="text-xl">{connection.address}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="outline outline-2 outline-secondary rounded-full text-lg text-center h-[2.5rem] flex items-center justify-center">
                  Тип підключення: {connection.connection_type}
                </p>
                {connection.status === 'Очікується' ? (
                <p className="outline outline-2 outline-secondary rounded-full text-lg text-center h-[2.5rem] flex items-center justify-center">
                  Тарифний план: {plan.name}
                </p>
                ) : (
                <Select
                  value={connection.plan_id.toString()}
                  onValueChange={(value) => {
                    setSelectedPlanId(parseInt(value));
                    setChangingConnectionId(connection.connection_id);
                    setPlanDialogOpen(true);
                  }}
                >
                  <SelectTrigger className="outline outline-1 outline-secondary rounded-full text-lg text-center flex items-center justify-center h-[2.5rem]">
                    Тарифний план: {plan.name}
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.plan_id} value={plan.plan_id.toString()}>
                        {plan.name} ({planMap[plan.plan_id].monthly_price} ₴ / місяць)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                )}
                <p className="outline outline-2 outline-secondary rounded-full text-lg text-center h-[2.5rem] flex items-center justify-center">
                  Статус: {connection.status}
                </p>
                <Select
                  value={connection.recurring_billing ? "1" : "0"}
                  onValueChange={(value) => 
                    handleRecurringBillingChange(connection.connection_id, value === "1")
                  }
                >
                <SelectTrigger className="outline outline-1 outline-secondary rounded-full text-lg text-center flex items-center justify-center h-[2.5rem]">
                  Автоплатіж: {connection.recurring_billing ? "Увімкнений" : "Вимкнений"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Увімкнений</SelectItem>
                  <SelectItem value="0">Вимкнений</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
              <CardFooter>
                {connection.status === 'Очікується' ? (
                  <div className="w-full text-center">
                    Ваше підключення в процесі встановлення
                  </div>
                ) : (
                  <Button
                    className="w-full rounded-full"
                    onClick={() => activateConnection(connection.connection_id, connection.plan_id)}
                    disabled={connection.status == 'Активне' || balance < activationPrice}
                  >
                    {connection.status === 'Активне'
                      ? 'Активовано'
                      : `Активувати (${activationPrice.toFixed(2)} ₴)`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Change Plan Confirmation */}
      <AlertDialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Зміна тарифного плану
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p>
            Чи точно ви хочете змінити тарифний план? 
            Щоб продовжити користуватися послугою після зміни, буде необхідно сплатити її нову ціну.
            <br /><br />
            <strong>Пропорційна вартість до кінця місяця: {proratedPrices[selectedPlanId]} ₴</strong>
          </p>
          <AlertDialogFooter>
            <Button onClick={() => setPlanDialogOpen(false)} variant="secondary">
              Відмінити
            </Button>
            <Button onClick={handleChangePlan}>
              Підтвердити
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

			{/* Credit Card Dialog */}
			<Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }}>
          <DialogHeader>
            <DialogTitle>Поповнення балансу</DialogTitle>
            <DialogDescription>
              Введіть дані картки для поповнення балансу на {amount.toFixed(2)} ₴
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cardNumber" className="text-right">
                Номер картки
              </Label>
              <Input
                id="cardNumber"
                value={cardDetails.number}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
                className="col-span-3"
                maxLength={19} // 16 digits + 3 spaces
                inputMode="numeric"
								onKeyDown={(e) => {
  							  if (!/[0-9]|Backspace|Tab|Delete|Arrow/.test(e.key)) {
  							    e.preventDefault();
  							  }
  							}}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cardName" className="text-right">
                Ім'я на картці
              </Label>
              <Input
                id="cardName"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                placeholder="John Doe"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cardExpiry" className="text-right">
                Термін дії
              </Label>
              <Input
                id="cardExpiry"
                value={cardDetails.expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className="col-span-3"
                maxLength={5} // MM/YY
                inputMode="numeric"
								onKeyDown={(e) => {
  							  if (!/[0-9]|Backspace|Tab|Delete|Arrow/.test(e.key)) {
  							    e.preventDefault();
  							  }
  							}}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cardCvv" className="text-right">
                CVV
              </Label>
              <Input
                id="cardCvv"
                value={cardDetails.cvv}
                onChange={handleCvvChange}
                placeholder="123"
                className="col-span-3"
                maxLength={3}
                inputMode="numeric"
								onKeyDown={(e) => {
  							  if (!/[0-9]|Backspace|Tab|Delete|Arrow/.test(e.key)) {
  							    e.preventDefault();
  							  }
  							}}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCardDialogOpen(false)} variant="secondary">
              Скасувати
            </Button>
            <Button onClick={handleCardSubmit} disabled={!isFormValid()}>
              Підтвердити оплату
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
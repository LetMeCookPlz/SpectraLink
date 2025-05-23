"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export default function BalanceCard({ userBalance }) {
  const [balance, setBalance] = useState(userBalance)
  const [amount, setAmount] = useState(0)

	const handleAddBalance = async (e) => {
		e.preventDefault()
		setBalance(prevBalance => prevBalance + amount);
		const sum = amount;
		setAmount(0);
		try {
      const response = await fetch("/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sum: sum }),
      });
    } catch (error) {
      console.error("Error:", error);
    }
	};

  return (
    <Card className="w-full max-w-md mx-auto bg-transparent border-transparent mt-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Ваш баланс</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-4xl font-bold text-center" aria-live="polite">
          ₴{balance.toFixed(2)}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Поповнення балансу</span>
            <span>₴{amount.toFixed(2)}</span>
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
          Поповнити баланс на ₴{amount.toFixed(2)}
        </Button>
      </CardFooter>
    </Card>
  )
}


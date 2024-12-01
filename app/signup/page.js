'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function SignupComponent() {
  const [email, setEmail] = useState("")
  const [PIB, setPIB] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("") 
    setSuccess(false) 
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, PIB, password }),
      })
      if (response.ok) {
        setSuccess(true)
      } else {
        const data = await response.json()
        setError(data.message || "Signup failed. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Реєстрація</CardTitle>
            <CardDescription>
              Введіть ваші дані щоб створити новий акаунт.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Помилка</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Акаунт створений</AlertTitle>
                <AlertDescription>Ваш акаунт був успішно створений, тепер ви можете авторизуватися.</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@mail.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="PIB">ПІБ</Label>
              <Input 
                id="PIB" 
                type="text" 
                required 
                value={PIB}
                onChange={(e) => setPIB(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">Зареєструватися</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


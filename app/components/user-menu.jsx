'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ChevronDown } from 'lucide-react'

export function UserMenu({ email, isPrivileged }) {
  const router = useRouter()
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState(email)
  const [newPassword, setNewPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {};
    if (newEmail) formData.newEmail = newEmail;
    if (newPassword) formData.newPassword = newPassword;
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Failed to save settings.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      }) 
      if (response.ok) {
        router.push('/')
        window.location.reload()
      } else {
        console.error('Failed to log out');
      } 
    } catch (error) {
      console.error("An error occurred:", error)
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isPrivileged && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Адміністрування
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="w-full">Користувачі</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/plans" className="w-full">Тарифні плани</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/transactions" className="w-full">Транзакції</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/statistics" className="w-full">Статистика</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {email}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="w-full">Особистий кабінет</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
            Налаштування
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(event) => {
            event.preventDefault()
            setIsAlertDialogOpen(true)
          }}>
            Вихід
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }} className="shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Вихід</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете вийти з аканту?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>Відмінити</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Підтвердити</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }} className="shadow-lg">
          <DialogHeader>
            <DialogTitle>Налаштування акаунту</DialogTitle>
            <DialogDescription>
              Тут ви можете змінювати свої особисті дані. Натисність "Зберігти зміни", коли будете готові.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newEmail" className="text-right">
                  Новий Email
                </Label>
                <Input
                  id="newEmail"
                  defaultValue={email}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">
                  Новий пароль
                </Label>
                <Input
                  type="password"
                  id="newPassword"
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Зберігти зміни</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


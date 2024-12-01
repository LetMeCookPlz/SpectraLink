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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
	DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ChevronDown } from 'lucide-react'

export function UserMenu({ email }) {
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
				window.location.reload()
				router.push('/')
			} else {
				console.error('Failed to log out');
			} 
		} catch (error) {
			console.error("An error occurred:", error)
		}
	};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {email}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="w-full">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(event) => {
          event.preventDefault()
          setIsAlertDialogOpen(true)
        }}>
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }} className="shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure that you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }} className="shadow-lg">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Make changes to your account here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
				<form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newEmail" className="text-right">
              New Email
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
              New Password
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
          <Button type="submit">Save changes</Button>
        </DialogFooter>
				</form>
      </DialogContent>
    </Dialog>
    </DropdownMenu>
)
}

'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { useRouter } from "next/navigation"

export default function Details({ plan, loggedIn }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [connectionType, setConnectionType] = useState('Coaxial'); 
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { plan_id: plan.plan_id, address, connection_type: connectionType };
    try {
      const response = await fetch('/api/connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDialogOpen(false);  
        router.push('/dashboard');
      } else {
        console.error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }} >
          <DialogHeader>
            <DialogTitle>Деталі нового підключення</DialogTitle>
            <DialogDescription>
              Для оформлення заявки на підключення, надайте нам необхідну інформацію.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="planSelect" className="text-right">
                  Обраний план
                </Label>
                <Input
                  id="planSelect"
                  value={plan.name}
                  disabled
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Адреса
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="connectionType" className="text-right">
                  Тип підключення
                </Label>
                <Select
                  value={connectionType}
                  onValueChange={(value) => setConnectionType(value)} 
                >
                  <SelectTrigger id="connectionType" className="col-span-3">
                    <SelectValue placeholder="Select a connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Коаксіальне">Коаксіальне</SelectItem>
                    <SelectItem value="Оптоволокно">Оптоволокно</SelectItem>
                    <SelectItem value="DSL">DSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Надіслати</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        className="w-full rounded-full"
        onClick={() => loggedIn ? setIsDialogOpen(true) : router.push('/login')}
      >
        Підключити
      </Button>
    </>
  );
}


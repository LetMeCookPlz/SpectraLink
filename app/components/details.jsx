'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { useRouter } from "next/navigation"

export default function Details({ plan }) {
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
            <DialogTitle>Connection Details</DialogTitle>
            <DialogDescription>
              Enter the details below to submit a connection request.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="planSelect" className="text-right">
                  Selected Plan
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
                  Address
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="connectionType" className="text-right">
                  Connection Type
                </Label>
                <Select
                  value={connectionType}
                  onValueChange={(value) => setConnectionType(value)} 
                >
                  <SelectTrigger id="connectionType" className="col-span-3">
                    <SelectValue placeholder="Select a connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coaxial">Coaxial</SelectItem>
                    <SelectItem value="Fiber">Fiber</SelectItem>
                    <SelectItem value="DSL">DSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        className="w-full rounded-full"
        onClick={() => setIsDialogOpen(true)} 
      >
        Select Plan
      </Button>
    </>
  );
}


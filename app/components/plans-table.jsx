"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export function PlansTable({ plansData }) {
  const [plans, setPlans] = useState(plansData);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState({});
	const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    volume: "",
    bandwidth: "",
  });

  const handleEditPlan = async () => {
    setEditDialogOpen(false);
    try {
      const response = await fetch("/api/admin/edit-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPlan),
      });
      if (!response.ok) throw new Error("Failed to save plan changes");
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.plan_id === editPlan.plan_id ? editPlan : plan
        )
      );
      console.log("Plan updated successfully");
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

	const handleCreatePlan = async () => {
    setCreateDialogOpen(false);
    try {
      const response = await fetch("/api/admin/create-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan),
      });
      if (!response.ok) throw new Error("Failed to create plan");
      const createdPlan = {
				plan_id: plans.length ? plans[plans.length - 1].plan_id + 1 : 1, // Generate a new ID based on the existing plans
				...newPlan,
			};
			setPlans((prevPlans) => [...prevPlans, createdPlan]);
      setNewPlan({ name: "", price: "", volume: "", bandwidth: "" });
      console.log("Plan created successfully");
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  const columns = [
    {
      accessorKey: "plan_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-3"
        >
          ID <ArrowUpDown className="ml-2 h-4 w-4"/>
        </Button>
      ),
      cell: ({ row }) => <div className="pl-4">{row.getValue("plan_id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Назва плану",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "price",
      header: "Ціна",
      cell: ({ row }) => `$${row.getValue("price")}`,
    },
    {
      accessorKey: "volume",
      header: "Обсяг трафіку",
      cell: ({ row }) => `${row.getValue("volume")} ГБ`,
    },
    {
      accessorKey: "bandwidth",
      header: "Швидкість",
      cell: ({ row }) => `${row.getValue("bandwidth")} Мб/с`,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const plan = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => {
                setEditPlan(plan);
                setEditDialogOpen(true);
              }}>
                Редагувати план
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: plans,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col items-center mt-24 px-4">
      <div className="w-full max-w-4xl rounded-md border mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
			<Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
        Створити новий план
      </Button>
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent style={{ backgroundColor: "hsl(222.2, 84%, 4.9%)" }}>
          <DialogHeader>
            <DialogTitle>Створити новий план</DialogTitle>
            <DialogDescription>
              Натисніть "Додати план", коли будете готові.
            </DialogDescription>
          </DialogHeader>
          <form>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Назва плану</Label>
                <Input
                  id="name"
                  value={newPlan.name}
                  className="col-span-3"
                  onChange={(e) =>
                    setNewPlan((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Ціна ($)</Label>
                <Input
                  id="price"
                  value={newPlan.price}
                  className="col-span-3"
                  onChange={(e) =>
                    setNewPlan((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="volume" className="text-right">Обсяг (ГБ)</Label>
                <Input
                  id="volume"
                  value={newPlan.volume}
                  className="col-span-3"
                  onChange={(e) =>
                    setNewPlan((prev) => ({ ...prev, volume: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bandwidth" className="text-right">Швидкість (Mbps)</Label>
                <Input
                  id="bandwidth"
                  value={newPlan.bandwidth}
                  className="col-span-3"
                  onChange={(e) =>
                    setNewPlan((prev) => ({ ...prev, bandwidth: e.target.value }))
                  }
                />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCreateDialogOpen(false)}>
              Відмінити
            </Button>
            <Button onClick={handleCreatePlan}>Додати план</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)'}}>
          <DialogHeader>
            <DialogTitle>Редагування плану</DialogTitle>
						<DialogDescription>Натисніть "Зберегти зміни", коли будете готові.</DialogDescription>
          </DialogHeader>
          <form>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Назва плану</Label>
                <Input
                  id="name"
                  value={editPlan?.name || ""}
                  className="col-span-3"
									onChange={(e) =>
                    setEditPlan((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Ціна ($)</Label>
                <Input
                  id="price"
                  value={editPlan?.price || ""}
                  className="col-span-3"
									onChange={(e) =>
                    setEditPlan((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="volume" className="text-right">Обсяг (ГБ)</Label>
                <Input
                  id="volume"
                  value={editPlan?.volume || ""}
                  className="col-span-3"
									onChange={(e) =>
                    setEditPlan((prev) => ({ ...prev, volume: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bandwidth" className="text-right">Швидкість (Mbps)</Label>
                <Input
                  id="bandwidth"
                  value={editPlan?.bandwidth || ""}
									className="col-span-3"
									onChange={(e) =>
                    setEditPlan((prev) => ({ ...prev, bandwidth: e.target.value }))
                  }
                />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditDialogOpen(false)}>
              Відмінити
            </Button>
            <Button onClick={handleEditPlan}>Зберегти зміни</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

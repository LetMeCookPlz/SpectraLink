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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ConnectionsTable({ connectionsData, plansData }) {
  const [connections, setConnections] = useState(connectionsData);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editConnection, setEditConnection] = useState({});
  const [deleteConnectionID, setDeleteConnectionID] = useState(null);
	const [billingDialogOpen, setBillingDialogOpen] = useState(false);

	const handleSetup = async (connection) => {
    try {
      const updatedConnection = { ...connection, status: "Призупинене" };
      const response = await fetch("/api/admin/setup-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConnection),
      });

      if (!response.ok) {
        throw new Error("Failed to update connection status");
      }

      setConnections((prevConnections) =>
        prevConnections.map((conn) =>
          conn.connection_id === connection.connection_id
            ? updatedConnection
            : conn
        )
      );
    } catch (error) {
      console.error("Error updating connection status:", error);
    }
  };

  const handleEditConnection = async () => {
    setEditDialogOpen(false);
    try {
      const response = await fetch("/api/admin/edit-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editConnection),
      });

      if (!response.ok) throw new Error("Failed to update connection");

      setConnections((prev) =>
        prev.map((conn) =>
          conn.connection_id === editConnection.connection_id ? editConnection : conn
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConnection = async () => {
    setDeleteDialogOpen(false);
    setConnections((prev) =>
      prev.filter((conn) => conn.connection_id !== deleteConnectionID)
    );

    try {
      await fetch("/api/admin/delete-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: deleteConnectionID }),
      });
    } catch (err) {
      console.error(err);
    }
  };

	const handleRunBilling = async () => {
  setBillingDialogOpen(false);
  try {
    const response = await fetch("/api/admin/run-billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to run billing");
    console.log("Billing completed successfully");
		window.location.reload();
  } catch (err) {
    console.error("Error running billing:", err);
  }
};

  const columns = [
    {
      accessorKey: "connection_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-3"
        >
          ID <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="pl-4">{row.getValue("connection_id")}</div>,
    },
		{
      accessorKey: "user_id",
      header: "ID клієнта",
      cell: ({ row }) => <div>{row.getValue("user_id")}</div>,
    },
		{
		  accessorKey: "plan_id",
		  header: "План",
		  cell: ({ row }) => {
		    const planId = row.getValue("plan_id");
		    const plan = plansData.find(p => p.plan_id === planId);
		    return <div>{plan.name}</div>;
		  },
		},
    {
      accessorKey: "address",
      header: "Адреса",
      cell: ({ row }) => <div>{row.getValue("address")}</div>,
    },
    {
      accessorKey: "connection_type",
      header: "Тип підключення",
      cell: ({ row }) => <div>{row.getValue("connection_type")}</div>,
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => <div className="font-medium">{row.getValue("status")}</div>,
    },
    {
      accessorKey: "recurring_billing",
      header: "Автоплатіж",
      cell: ({ row }) => (
        <div>{row.getValue("recurring_billing") ? "Так" : "Ні"}</div>
      ),
    },
		{
		id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const connection = row.original;
        return connection.status === "Очікується" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSetup(connection)}
          >
            Підтвердити
          </Button>
        ) : null;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const connection = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  setEditConnection(connection);
                  setEditDialogOpen(true);
                }}
              >
                Редагувати
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteConnectionID(connection.connection_id);
                  setDeleteDialogOpen(true);
                }}
              >
                Видалити
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }
  ];

  const table = useReactTable({
    data: connections,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters },
  });

  return (
    <div className="flex flex-col items-center mt-24 px-4">
      <div className="flex items-center mb-4 w-full max-w-4xl">
        <Input
          placeholder="Фільтрувати за адресою..."
          value={table.getColumn("address")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("address")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="w-full max-w-4xl rounded-md border mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                  Немає результатів.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between w-full max-w-4xl">
  			<Button
  			  variant="outline"
  			  size="sm"
  			  onClick={() => setBillingDialogOpen(true)}
  			>
  			  Провести білінг
  			</Button>
				<div className="flex items-center justify-end space-x-2 py-4">
      	  <Button
      	    variant="outline"
      	    size="sm"
      	    onClick={() => table.previousPage()}
      	    disabled={!table.getCanPreviousPage()}
      	  >
      	    Попередня
      	  </Button>
      	  <Button
      	    variant="outline"
      	    size="sm"
      	    onClick={() => table.nextPage()}
      	    disabled={!table.getCanNextPage()}
      	  >
      	    Наступна
      	  </Button>
      	</div>
    	</div>

      {/* Edit Connection Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent style={{ backgroundColor: "hsl(222.2, 84%, 4.9%)" }}>
          <DialogHeader>
            <DialogTitle>Редагування підключення</DialogTitle>
            <DialogDescription>Натисніть "Зберегти зміни", коли будете готові.</DialogDescription>
          </DialogHeader>
		
          <div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
					  <Label className="text-right">Тарифний план</Label>
					  <Select
					    value={editConnection?.plan_id?.toString() || ""}
					    onValueChange={(val) =>
					      setEditConnection((prev) => ({
					        ...prev,
					        plan_id: parseInt(val),
					      }))
					    }
					  >
					    <SelectTrigger className="col-span-3">
					      <SelectValue />
					    </SelectTrigger>
					    <SelectContent>
					      {plansData.map((plan) => (
					        <SelectItem key={plan.plan_id} value={plan.plan_id.toString()}>
					          {plan.name}
					        </SelectItem>
					      ))}
					    </SelectContent>
					  </Select>
						</div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Адреса</Label>
              <Input
                value={editConnection?.address || ""}
                onChange={(e) =>
                  setEditConnection((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Тип</Label>
              <Select
                value={editConnection?.connection_type || ""}
                onValueChange={(val) =>
                  setEditConnection((prev) => ({ ...prev, connection_type: val }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Коаксіальне">Коаксіальне</SelectItem>
                  <SelectItem value="Оптоволокно">Оптоволокно</SelectItem>
                  <SelectItem value="DSL">DSL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Статус</Label>
              <Select
                value={editConnection?.status || ""}
                onValueChange={(val) =>
                  setEditConnection((prev) => ({ ...prev, status: val }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Очікується">Очікується</SelectItem>
                  <SelectItem value="Активне">Активне</SelectItem>
                  <SelectItem value="Призупинене">Призупинене</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Автоплатіж</Label>
              <Select
                value={editConnection?.recurring_billing ? "1" : "0"}
                onValueChange={(val) =>
                  setEditConnection((prev) => ({
                    ...prev,
                    recurring_billing: val === "1",
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Так</SelectItem>
                  <SelectItem value="0">Ні</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setEditDialogOpen(false)} variant="secondary">
              Відмінити
            </Button>
            <Button onClick={handleEditConnection}>Зберегти зміни</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Connection Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: "hsl(222.2, 84%, 4.9%)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалення підключення</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Ви впевнені, що хочете видалити це підключення?</p>
          <AlertDialogFooter>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="secondary">
              Відмінити
            </Button>
            <Button onClick={handleDeleteConnection}>Видалити</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

			{/* Billing Confirmation */}
			<AlertDialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
			  <AlertDialogContent style={{ backgroundColor: "hsl(222.2, 84%, 4.9%)" }}>
			    <AlertDialogHeader>
			      <AlertDialogTitle>Білінг</AlertDialogTitle>
			    </AlertDialogHeader>
			    <p>Ви впевнені, що хочете провести білінг для всіх активних підключень?</p>
			    <AlertDialogFooter>
			      <Button onClick={() => setBillingDialogOpen(false)} variant="secondary">
			        Відмінити
			      </Button>
			      <Button onClick={handleRunBilling}>Підтвердити</Button>
			    </AlertDialogFooter>
			  </AlertDialogContent>
			</AlertDialog>
    </div>
  );
}

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
	DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

export function AdminTable({ usersData }) {
	const [users, setUsers] = useState(usersData);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserID, setDeleteUserID] = useState([]);
  const [editUser, setEditUser] = useState([]);

	const handleEditUser = async () => {
		setEditDialogOpen(false); 
		try {
			const response = await fetch("/api/edit-user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(editUser),
			});
			if (!response.ok) {
				throw new Error("Failed to save user changes");
			}
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user.user_id === editUser.user_id ? editUser : user
				)
			);
			console.log("User updated successfully");
		} catch (error) {
			console.error("Error updating user:", error);
		}
	};

	const handleDeleteUser = async () => {
		setDeleteDialogOpen(false);
		setUsers((prevUsers) =>
      prevUsers.filter((user) => user.user_id !== deleteUserID)
    );
    try {
      await fetch("/api/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: deleteUserID }),
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const columns = [
    {
      accessorKey: "user_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="pl-3">
          ID
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="pl-4">{row.getValue("user_id")}</div>,
    },
    {
      accessorKey: "PIB",
      header: "Повне ім'я",
      cell: ({ row }) => <div>{row.getValue("PIB")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "balance",
      header: () => <div>Баланс</div>,
      cell: ({ row }) => {
        const balance = parseFloat(row.getValue("balance"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(balance);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "user_type",
      header: "Тип користувача",
      cell: ({ row }) => <div className="capitalize">{row.getValue("user_type")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

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
              	setEditUser(user); 
              	setEditDialogOpen(true); 
            	}}>Редагувати користувача</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(event) => {
          			event.preventDefault()
          			setDeleteDialogOpen(true)
								console.log(row.getValue("user_id"))
          			setDeleteUserID(row.getValue("user_id"))
        			}}>Видалити користувача</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="flex flex-col items-center mt-24 px-4">
      <div className="flex items-center mb-4 w-full max-w-4xl">
        <Input
          placeholder="Фільтрування за ПІБ..."
          value={(table.getColumn("PIB")?.getFilterValue() ?? "")}
          onChange={(event) =>
            table.getColumn("PIB")?.setFilterValue(event.target.value)
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4 w-full max-w-4xl">
        <div className="space-x-2">
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
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  			<DialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }}>
  			  <DialogHeader>
  			    <DialogTitle>Редагування користувача</DialogTitle>
  			    <DialogDescription>Натисніть "Зберігти зміни", коли будете готові.</DialogDescription>
  			  </DialogHeader>
					<form >
  			  <div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="PIB" className="text-right">
            	  Повне ім'я
            	</Label>
  			    	<Input
								id='PIB'
  			    	  value={editUser?.PIB || ""}
  			    	  onChange={(e) =>
  			    	    setEditUser((prev) => ({ ...prev, PIB: e.target.value }))
  			    	  }
  			    	  placeholder="Повне ім'я"
								className="col-span-3"
  			    	/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="email" className="text-right">
            	  Email
            	</Label>
							<Input
								id='email'
  			    	  value={editUser?.email || ""}
  			    	  onChange={(e) =>
  			    	    setEditUser((prev) => ({ ...prev, email: e.target.value }))
  			    	  }
  			    	  placeholder="Email"
								className="col-span-3"
  			    	/>
            </div>
						<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="email" className="text-right">
            	Баланс ($)
            </Label>
							<Input
								id='balance'
  			    	  value={editUser?.balance || ""}
  			    	  onChange={(e) =>
  			    	    setEditUser((prev) => ({ ...prev, balance: e.target.value }))
  			    	  }
  			    	  placeholder="0"
								className="col-span-3"
  			    	/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="user_type" className="text-right">
            		Тип користув.
            	</Label>
							<Select
                value={editUser?.user_type || ""}
								onValueChange={(value) =>
									setEditUser((prev) => ({ ...prev, user_type: value }))
								}
              >
                <SelectTrigger id="user_type" className="col-span-3">
                  <SelectValue placeholder="Select the user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
						</div>
  			  </div>
					</form>
  			  <DialogFooter>
  			    <Button onClick={() => setEditDialogOpen(false)} variant="secondary">
  			      Відмінити
  			    </Button>
  			    <Button onClick={handleEditUser}>Зберегти</Button>
  			  </DialogFooter>
  			</DialogContent>
			</Dialog>
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'hsl(222.2, 84%, 4.9%)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Видалення користувча
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p>Ви впевнені, що хочете видалити користувача?</p>
          <AlertDialogFooter>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="secondary">
              Відмінити
            </Button>
            <Button onClick={handleDeleteUser}>Підтвердити</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

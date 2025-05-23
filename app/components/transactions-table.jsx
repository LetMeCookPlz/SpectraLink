"use client"

import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TransactionsTable({ transactionsData }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
	
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').slice(0, 19);
  };

  const columns = [
    {
      accessorKey: "transaction_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-3"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="pl-4">{row.getValue("transaction_id")}</div>,
    },
    {
      accessorKey: "user_id",
      header: "ID клієнта",
      cell: ({ row }) => <div className="pl-7">{row.getValue("user_id")}</div>,
    },
    {
      accessorKey: "sum",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Сума
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const sum = row.getValue("sum");
        const formatted = new Intl.NumberFormat("uk-UA", {
          style: "currency",
          currency: "UAH",
          signDisplay: "always",
        }).format(sum);
        return <div className={`pl-3 font-medium ${sum < 0 ? "text-red-500" : "text-green-500"}`}>{formatted}</div>;
      },
    },
    {
      accessorKey: "date",
      header: "Дата транзакції",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("date"))}</div>;
      },
    },
  ];

  const table = useReactTable({
    data: transactionsData,
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

  const totalIncome = useMemo(() => {
    return transactionsData
      .filter(transaction => transaction.sum > 0)
      .reduce((sum, transaction) => sum + transaction.sum, 0);
  }, [transactionsData]);

  return (
    <div className="flex flex-col items-center mt-24 px-4">
      <div className="flex items-center mb-4 w-full max-w-4xl">
        <Input
          placeholder="Фільтрування за ID клієнта..."
          value={(table.getColumn("user_id")?.getFilterValue() ?? "")}
          onChange={(event) =>
            table.getColumn("user_id")?.setFilterValue(event.target.value)
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
      <div className="flex items-center justify-between space-x-2 py-2 w-full max-w-4xl">
        <div className="text-base font-bold">
          Загальний дохід: {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalIncome)}
        </div>
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
    </div>
  );
}


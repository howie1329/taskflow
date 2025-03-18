"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import useGetTasks from "@/hooks/useGetTasks";

export const TaskTable = () => {
  // const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading } = useGetTasks();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table className="w-full border-black border-2 ">
          <TableHeader className="border-black border-[2px]">
            {table.getHeaderGroups().map((headerGroups) => (
              <TableRow key={headerGroups.id}>
                {headerGroups.headers.map((headers) => (
                  <TableHead
                    key={headers.id}
                    className="border-black border-[1px]"
                  >
                    {headers.isPlaceholder
                      ? null
                      : flexRender(
                          headers.column.columnDef.header,
                          headers.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="border-black border-l-[1px]"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
const testData = [
  {
    id: "123e627b-380b-4ff9-9fde-b8f2443808fb",
    created_at: "2025-03-05T18:57:04.448494+00:00",
    title: "Notes & Documentation",
    userId: null,
    description: "Create and organize notes with ease",
    date: null,
    isCompleted: false,
    vector: null,
    labels: ["notes", "documentation"],
    priority: "Low",
    categories: null,
    position: 1,
  },
];

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor("title", {
    header: () => "Title",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("description", {
    header: () => "Description",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("priority", {
    header: () => "Priority",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("isCompleted", {
    header: () => "Status",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
];

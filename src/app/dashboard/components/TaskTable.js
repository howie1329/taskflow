"use client";
import React from "react";
import {
  Table,
  TableBody,
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
import useGetTasks from "@/features/tasks/hooks/useGetTasks";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

export const TaskTable = () => {
  const { data, isLoading } = useGetTasks();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-50/50">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-semibold text-gray-700 py-4"
                >
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-gray-50/50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const columnHelper = createColumnHelper();

const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  return (
    <Badge className={`${priorityStyles[priority]} font-medium`}>
      {priority}
    </Badge>
  );
};

const StatusBadge = ({ isCompleted }) => {
  return (
    <div className="flex items-center gap-2">
      {isCompleted ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <Clock className="w-4 h-4 text-yellow-600" />
      )}
      <span className="text-sm font-medium">
        {isCompleted ? "Completed" : "In Progress"}
      </span>
    </div>
  );
};

const columns = [
  columnHelper.accessor("title", {
    header: () => "Task",
    cell: (info) => (
      <div className="font-medium text-gray-900">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor("description", {
    header: () => "Description",
    cell: (info) => (
      <div className="text-gray-600 line-clamp-2">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor("priority", {
    header: () => "Priority",
    cell: (info) => <PriorityBadge priority={info.getValue()} />,
  }),
  columnHelper.accessor("isCompleted", {
    header: () => "Status",
    cell: (info) => <StatusBadge isCompleted={info.getValue()} />,
  }),
];

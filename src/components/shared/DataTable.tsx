//components/shared/DataTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./DataTablePagination";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  totalRecords?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  totalRecords,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // URL-driven state
  const page = Number(params.get("page") || 1);
  const size = Number(params.get("size") || 10);
  const role = params.get("role") || "";
  const sortParam = params.get("sort");

  const initialSorting: SortingState = sortParam
    ? [
        {
          id: sortParam.split(",")[0],
          desc: sortParam.split(",")[1] === "desc",
        },
      ]
    : [];

  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: size,
  });

  // Sync sorting -> URL
  useEffect(() => {
    const ps = new URLSearchParams(params);
    if (sorting[0]) {
      ps.set("sort", `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`);
    } else {
      ps.delete("sort");
    }
    ps.set("page", "1");
    router.replace(`${pathname}?${ps.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting, pathname, router]);

  // Sync pagination -> URL
  useEffect(() => {
    const ps = new URLSearchParams(params);
    ps.set("page", (pagination.pageIndex + 1).toString());
    ps.set("size", pagination.pageSize.toString());
    router.replace(`${pathname}?${ps.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, pathname, router]);

  const handleRoleChange = (v: string) => {
    const ps = new URLSearchParams(params);
    if (v && v !== "ALL") ps.set("role", v);
    else ps.delete("role");
    ps.set("page", "1");
    router.replace(`${pathname}?${ps.toString()}`);
  };

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { sorting, columnFilters, columnVisibility, pagination },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        {/* Không cần input search ở đây nữa! */}
        <div />
        <div className="flex items-center gap-2">
          <Select value={role || "ALL"} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:text-gray-200">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
              <SelectItem value="ALL">Tất cả vai trò</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              <SelectItem value={UserRole.ORGANIZER}>Organizer</SelectItem>
              <SelectItem value={UserRole.USER}>User</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <ListFilter className="mr-2 h-4 w-4 dark:text-gray-400" />
                Cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            >
              <DropdownMenuLabel className="dark:text-gray-400">
                Hiển thị cột
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:border-gray-700" />
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(val)}
                    className="dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    {(col.columnDef.header as string) || col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-auto rounded-md border dark:border-gray-700">
        <Table className="dark:bg-gray-800">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="dark:bg-gray-700">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="dark:text-gray-200 dark:bg-gray-700"
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="dark:border-gray-700 hover:dark:bg-gray-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="dark:text-gray-300 dark:border-gray-700"
                    >
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
                  className="h-24 text-center dark:text-gray-300 dark:bg-gray-800"
                >
                  Không có dữ liệu phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} totalRecords={totalRecords} />
    </div>
  );
}

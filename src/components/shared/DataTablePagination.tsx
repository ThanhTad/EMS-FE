//components/shared/DataTablePagination.tsx
"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalRecords?: number;
}

export function DataTablePagination<TData>({
  table,
  totalRecords,
}: DataTablePaginationProps<TData>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(
    searchParams.get("size") ?? table.getState().pagination.pageSize
  );
  const totalPages = table.getPageCount();

  const createPageURL = (page: number, newPageSize?: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    params.set("page", String(page));
    params.set("size", String(newPageSize ?? pageSize));
    return `${pathname}?${params.toString()}`;
  };

  const handleNavigation = (page: number, newSize?: number) => {
    if (page === currentPage && (!newSize || newSize === pageSize)) return;
    router.replace(createPageURL(page, newSize), { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
      <div className="text-sm text-muted-foreground dark:text-gray-300">
        {totalRecords != null
          ? `Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(
              currentPage * pageSize,
              totalRecords
            )} trong tổng số ${totalRecords} bản ghi`
          : `Trang ${currentPage} / ${totalPages}`}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium dark:text-gray-300">
            Số dòng mỗi trang:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const newSize = Number(value);
              handleNavigation(1, newSize);
            }}
          >
            <SelectTrigger className="h-8 w-[70px] dark:bg-gray-700 dark:text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              side="top"
              className="dark:bg-gray-800 dark:text-gray-300"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden lg:flex h-8 w-8 p-0 dark:bg-gray-700 dark:text-gray-300 hover:dark:bg-gray-600"
            onClick={() => handleNavigation(1)}
            disabled={currentPage === 1}
            aria-label="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-gray-300 hover:dark:bg-gray-600"
            onClick={() => handleNavigation(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-gray-300 hover:dark:bg-gray-600"
            onClick={() => handleNavigation(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden lg:flex h-8 w-8 p-0 dark:bg-gray-700 dark:text-gray-300 hover:dark:bg-gray-600"
            onClick={() => handleNavigation(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

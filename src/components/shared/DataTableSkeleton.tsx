// components/shared/DataTableSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number; // Số dòng skeleton, mặc định là 10
  // Thêm các props khác nếu cần (ví dụ: showHeader, showPagination)
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Skeleton for Filters/Actions */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-1/3 max-w-sm" /> {/* Input tìm kiếm */}
        <Skeleton className="h-10 w-24" /> {/* Nút ẩn/hiện cột */}
      </div>
      {/* Skeleton for Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-5 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Skeleton for Pagination */}
      <div className="flex items-center justify-between px-2 mt-4">
        <Skeleton className="h-8 w-1/4" /> {/* Text "x của y dòng được chọn" */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          <Skeleton className="h-8 w-32" />{" "}
          {/* Text "Số dòng mỗi trang" + Select */}
          <Skeleton className="h-8 w-24" /> {/* Text "Trang x của y" */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" /> {/* Nút trang đầu */}
            <Skeleton className="h-8 w-8" /> {/* Nút trang trước */}
            <Skeleton className="h-8 w-8" /> {/* Nút trang sau */}
            <Skeleton className="h-8 w-8" /> {/* Nút trang cuối */}
          </div>
        </div>
      </div>
    </div>
  );
}

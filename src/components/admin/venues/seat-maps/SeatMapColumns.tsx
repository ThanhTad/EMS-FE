// app/admin/venues/[venueId]/seat-maps/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SeatMap } from "@/types";
import { format, parseISO } from "date-fns";
import { SeatMapActionsCell } from "./SeatMapActionsCell";

export const SeatMapColumns: ColumnDef<SeatMap>[] = [
  {
    accessorKey: "name",
    header: "Tên Sơ đồ",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) =>
      row.original.description || (
        <span className="text-muted-foreground">Không có</span>
      ),
  },
  // Bạn có thể thêm cột "Số khu vực", "Tổng số ghế" nếu API trả về
  {
    accessorKey: "updatedAt",
    header: "Cập nhật lần cuối",
    cell: ({ row }) => {
      try {
        return row.original.updatedAt
          ? format(parseISO(row.original.updatedAt), "dd/MM/yyyy HH:mm")
          : "-";
      } catch {
        return <span className="text-muted-foreground">N/A</span>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SeatMapActionsCell seatMap={row.original} />,
  },
];

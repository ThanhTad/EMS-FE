// components/admin/events/EventTableColumns.tsx (PHIÊN BẢN MỚI)
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Event } from "@/types"; // Import các type cần thiết
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns"; // Giả sử bạn có hàm định dạng ngày tháng

// Hàm không còn nhận tham số `keyword` nữa
export const eventColumns: ColumnDef<Event>[] = [
  // Cột Tiêu đề
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tiêu đề
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title: string = row.getValue("title");
      // Bạn có thể thêm link ở đây nếu muốn
      return <div className="font-medium">{title}</div>;
    },
  },
  // Cột Trạng thái
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      // Giả sử `status` là một object { id, status, entityType }
      const status = row.original.status;
      if (!status) return "-";

      // Logic để chọn màu cho badge
      const getStatusVariant = (statusString: string) => {
        switch (statusString.toUpperCase()) {
          case "APPROVED":
          case "ACTIVE":
            return "success";
          case "PENDING_APPROVAL":
            return "secondary";
          case "REJECTED":
          case "CANCELED":
            return "destructive";
          default:
            return "outline";
        }
      };

      return (
        <Badge variant={getStatusVariant(status.status)}>{status.status}</Badge>
      );
    },
  },
  // Cột Ngày bắt đầu
  {
    accessorKey: "startDate",
    header: "Thời gian",
    cell: ({ row }) => {
      const startDate = row.original.startDate
        ? new Date(row.original.startDate)
        : null;
      const endDate = row.original.endDate
        ? new Date(row.original.endDate)
        : null;

      if (!startDate || !endDate)
        return <span className="text-muted-foreground">N/A</span>;

      return (
        <div className="text-sm">
          <p>BĐ: {format(startDate, "dd/MM/yy HH:mm")}</p>
          <p className="text-muted-foreground">
            KT: {format(endDate, "dd/MM/yy HH:mm")}
          </p>
        </div>
      );
    },
  },
  // Cột Địa điểm
  {
    accessorKey: "venue",
    header: "Địa điểm",
    cell: ({ row }) => {
      // Giả sử `venue` là một object { id, name }
      const venue = row.original.venue;
      return <div>{venue?.name || "N/A"}</div>;
    },
  },
  // Cột Hành động (Actions)
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/events/edit/${event.id}`}>Sửa sự kiện</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/events/${event.id}/tickets`}>Quản lý vé</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => alert(`Xem chi tiết sự kiện ${event.id}`)}
            >
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => alert(`Xóa sự kiện ${event.id}`)} // Thay alert bằng modal xác nhận
            >
              Xóa sự kiện
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

//components/admin/events/approval/ApprovalTableColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Event as EventType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export const approvalTableColumns: ColumnDef<EventType>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề sự kiện",
  },
  {
    accessorKey: "creator.fullName",
    header: "Nhà tổ chức",
  },
  {
    accessorKey: "createdAt",
    header: "Ngày gửi",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{date.toLocaleDateString("vi-VN")}</span>;
    },
  },
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
            <DropdownMenuItem asChild>
              <Link href={`/admin/events/approval/${event.id}`}>
                Xem & Duyệt
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

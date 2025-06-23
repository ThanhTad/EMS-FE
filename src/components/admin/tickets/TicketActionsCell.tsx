// components/admin/tickets/TicketActionsCell.tsx
"use client";

import { Ticket, Event } from "@/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
// import { useDeleteTicket } from "@/hooks/use-delete-ticket";

// Giả định kiểu dữ liệu như trong file columns
interface TicketWithEvent extends Ticket {
  event?: Pick<Event, "id" | "title" | "creatorId">;
}

interface TicketActionsCellProps {
  ticket: TicketWithEvent;
}

export default function TicketActionsCell({ ticket }: TicketActionsCellProps) {
  // const { mutate: deleteTicket, isPending } = useDeleteTicket();

  // Logic kiểm tra quyền không còn cần thiết ở đây nữa
  // vì dữ liệu đã được lọc ở phía server.
  // Backend sẽ là lớp bảo vệ cuối cùng nếu người dùng cố tình gọi API.

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/tickets/${ticket.id}/edit`}>Sửa</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500"
          // onClick={() => deleteTicket(ticket.id)}
          // disabled={isPending}
        >
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

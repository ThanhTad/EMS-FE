// components/admin/tickets/TicketTableColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ticket, User } from "@/types";
import HighlightedText from "@/components/ui/highlighted-text";
import TicketActionsCell from "./TicketActionsCell";
import { format, parse } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Hàm tính trạng thái vé
function getTicketStatus(ticket: Ticket): string {
  const now = new Date();
  const start = ticket.saleStartDate
    ? parse(ticket.saleStartDate, "yyyy-MM-dd'T'HH:mm:ss", new Date())
    : null;
  const end = ticket.saleEndDate
    ? parse(ticket.saleEndDate, "yyyy-MM-dd'T'HH:mm:ss", new Date())
    : null;

  if (ticket.availableQuantity === 0) return "Sold out";
  if (start && now < start) return "Pending";
  if (end && now > end) return "Ended";
  return "Active";
}

export function ticketColumns(
  keyword: string,
  eventIdToName: Record<string, string>,
  currentUser: User & { role: string; eventIds?: string[] },
  eventIdToCreatorId: Record<string, string>
): ColumnDef<Ticket>[] {
  return [
    {
      accessorKey: "ticketType",
      header: "Loại vé",
      cell: ({ row }) => (
        <HighlightedText text={row.original.ticketType} keyword={keyword} />
      ),
    },
    {
      accessorKey: "eventId",
      header: "Sự kiện",
      cell: ({ row }) =>
        eventIdToName[row.original.eventId] || (
          <span className="text-muted-foreground">N/A</span>
        ),
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) =>
        row.original.isFree ? (
          <Badge className="bg-blue-500">Miễn phí</Badge>
        ) : (
          <>
            {row.original.price?.toLocaleString()}₫
            {row.original.earlyBirdDiscount &&
              row.original.earlyBirdDiscount > 0 && (
                <Badge className="ml-2 bg-green-500">
                  Early Bird -{Math.round(row.original.earlyBirdDiscount * 100)}
                  %
                </Badge>
              )}
          </>
        ),
    },
    {
      accessorKey: "totalQuantity",
      header: "Tổng số",
      cell: ({ row }) => row.original.totalQuantity,
    },
    {
      accessorKey: "availableQuantity",
      header: "Còn lại",
      cell: ({ row }) => {
        const { availableQuantity, totalQuantity } = row.original;
        const warning =
          typeof availableQuantity === "number" &&
          typeof totalQuantity === "number" &&
          availableQuantity > 0 &&
          totalQuantity > 0 &&
          availableQuantity / totalQuantity < 0.1;
        return (
          <>
            <span>{availableQuantity}</span>
            {warning && (
              <Badge className="ml-2 bg-orange-500">Sắp hết vé</Badge>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "saleStartDate",
      header: "Bắt đầu bán",
      cell: ({ row }) => {
        const dateStr = row.original.saleStartDate;
        const date = dateStr
          ? parse(dateStr, "yyyy-MM-dd'T'HH:mm:ss", new Date())
          : null;
        return date ? (
          format(date, "dd/MM/yyyy HH:mm")
        ) : (
          <span className="text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: "saleEndDate",
      header: "Kết thúc bán",
      cell: ({ row }) => {
        const dateStr = row.original.saleEndDate;
        const date = dateStr
          ? parse(dateStr, "yyyy-MM-dd'T'HH:mm:ss", new Date())
          : null;
        return date ? (
          format(date, "dd/MM/yyyy HH:mm")
        ) : (
          <span className="text-muted-foreground">N/A</span>
        );
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = getTicketStatus(row.original);
        const color =
          status === "Active"
            ? "bg-green-600"
            : status === "Sold out"
            ? "bg-red-600"
            : status === "Pending"
            ? "bg-gray-500"
            : "bg-neutral-400";
        return <Badge className={color}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const ticket = row.original;
        // MODERATOR chỉ thao tác với vé của event mình tạo
        const eventCreatorId = eventIdToCreatorId[ticket.eventId];
        const canEditOrDelete =
          currentUser.role === "ROLE_ADMIN" ||
          (currentUser.role === "ROLE_ORGANIZER" &&
            eventCreatorId === currentUser.id);
        if (!canEditOrDelete) return null;
        return <TicketActionsCell ticket={ticket} />;
      },
    },
  ];
}

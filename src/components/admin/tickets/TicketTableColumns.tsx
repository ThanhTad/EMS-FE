// components/admin/tickets/TicketTableColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ticket, Event } from "@/types";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { formatISODate } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import TicketActionsCell from "./TicketActionsCell";

// Giả sử Ticket type từ API đã có event được populate
interface TicketWithEvent extends Ticket {
  event?: Pick<Event, "id" | "title" | "creatorId">;
}

export const ticketColumns: ColumnDef<TicketWithEvent>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên vé" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "event",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sự kiện" />
    ),
    cell: ({ row }) => {
      const event = row.original.event;
      if (!event) return <span className="text-muted-foreground">N/A</span>;
      return (
        <Link href={`/admin/events/${event.id}`} className="hover:underline">
          {event.title}
        </Link>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá vé" />
    ),
    cell: ({ row }) => formatPrice(row.original.price),
  },
  {
    accessorKey: "availableQuantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng còn lại" />
    ),
    cell: ({ row }) => {
      const { availableQuantity, totalQuantity } = row.original;
      if (
        typeof availableQuantity !== "number" ||
        typeof totalQuantity !== "number"
      ) {
        return <span className="text-muted-foreground">—</span>;
      }
      return `${availableQuantity} / ${totalQuantity}`;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => formatISODate(row.original.createdAt, "dd/MM/yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => <TicketActionsCell ticket={row.original} />,
  },
];

// app/admin/venues/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Venue } from "@/types";
import { format, parseISO } from "date-fns";
import HighlightedText from "@/components/ui/highlighted-text";
import { VenueActionsCell } from "./VenueActionsCell";

export const VenueColumns = (keyword: string): ColumnDef<Venue>[] => [
  {
    accessorKey: "name",
    header: "Tên địa điểm",
    cell: ({ row }) => (
      <HighlightedText
        text={row.original.name}
        keyword={keyword}
        className="font-medium"
      />
    ),
  },
  {
    accessorKey: "address",
    header: "Địa chỉ",
    cell: ({ row }) =>
      row.original.address ? (
        <HighlightedText text={row.original.address} keyword={keyword} />
      ) : (
        <span className="text-muted-foreground">Chưa có</span>
      ),
  },
  {
    accessorKey: "city",
    header: "Thành phố",
    cell: ({ row }) =>
      row.original.city ? (
        <HighlightedText text={row.original.city} keyword={keyword} />
      ) : (
        <span className="text-muted-foreground">Chưa có</span>
      ),
  },
  {
    accessorKey: "country",
    header: "Quốc gia",
    cell: ({ row }) =>
      row.original.country ? (
        <HighlightedText text={row.original.country} keyword={keyword} />
      ) : (
        <span className="text-muted-foreground">Chưa có</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      try {
        return format(parseISO(row.original.createdAt), "dd/MM/yyyy HH:mm");
      } catch {
        return <span className="text-muted-foreground">N/A</span>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <VenueActionsCell venue={row.original} />,
  },
];

// components/admin/users/EventTableColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Event } from "@/types";
import HighlightedText from "@/components/ui/highlighted-text";
import { format, parse } from "date-fns";
import EventActionsCell from "./EventActionsCell";

export function eventColumns(keyword: string): ColumnDef<Event>[] {
  return [
    {
      accessorKey: "title",
      header: "Tiêu đề sự kiện",
      cell: ({ row }) => (
        <HighlightedText text={row.original.title} keyword={keyword} />
      ),
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) =>
        row.original.description ? (
          <HighlightedText text={row.original.description} keyword={keyword} />
        ) : (
          <span className="text-muted-foreground">N/A</span>
        ),
    },
    {
      accessorKey: "location",
      header: "Địa điểm",
      cell: ({ row }) =>
        row.original.location ? (
          <HighlightedText text={row.original.location} keyword={keyword} />
        ) : (
          <span className="text-muted-foreground">N/A</span>
        ),
    },
    {
      accessorKey: "categories",
      header: "Danh mục",
      cell: ({ row }) => {
        const categories = row.original.categories ?? [];
        if (!categories.length)
          return <span className="text-muted-foreground">N/A</span>;
        return (
          <span>
            {categories.map((cat: { name: string }) => cat.name).join(", ")}
          </span>
        );
      },
    },
    {
      accessorKey: "creator",
      header: "Người tạo",
      cell: ({ row }) =>
        row.original.organizer?.fullName ||
        row.original.organizer?.username || (
          <span className="text-muted-foreground">N/A</span>
        ),
    },
    {
      accessorKey: "startDate",
      header: "Bắt đầu",
      cell: ({ row }) => {
        const dateStr = row.original.startDate;
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
      accessorKey: "endDate",
      header: "Kết thúc",
      cell: ({ row }) => {
        const dateStr = row.original.endDate;
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
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => {
        const dateStr = row.original.createdAt;
        const date = dateStr
          ? parse(dateStr, "yyyy-MM-dd'T'HH:mm:ss", new Date())
          : null;
        return date ? (
          format(date, "dd/MM/yyyy HH:mm")
        ) : (
          <span className="text-muted-foreground">N/A</span>
        );
      },
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => <EventActionsCell event={row.original} />,
    },
  ];
}

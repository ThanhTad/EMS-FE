// components/admin/events/EventTableColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Event } from "@/types";
import HighlightedText from "@/components/ui/highlighted-text";
import { format } from "date-fns";
import EventActionsCell from "./EventActionsCell";
import { Badge } from "@/components/ui/badge";

const statusVariantMap: {
  [key: string]: "default" | "secondary" | "destructive" | "outline";
} = {
  APPROVED: "default", // Màu xanh (mặc định của shadcn)
  PENDING_APPROVAL: "secondary", // Màu xám
  REJECTED: "destructive", // Màu đỏ
};

export function eventColumns(keyword: string): ColumnDef<Event>[] {
  return [
    {
      accessorKey: "title",
      header: "Tiêu đề sự kiện",
      cell: ({ row }) => (
        <div className="font-medium">
          <HighlightedText text={row.original.title} keyword={keyword} />
        </div>
      ),
    },
    {
      // Sửa lại: Dùng venue.name thay cho location
      accessorKey: "venue.name",
      header: "Địa điểm",
      cell: ({ row }) =>
        row.original.venue?.name ? (
          <HighlightedText text={row.original.venue.name} keyword={keyword} />
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
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <Badge key={cat.id} variant="secondary">
                {cat.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      // Sửa lại: Dùng creator thay cho organizer
      accessorKey: "creator",
      header: "Người tạo",
      cell: ({ row }) =>
        row.original.creator?.fullName ||
        row.original.creator?.username || (
          <span className="text-muted-foreground">N/A</span>
        ),
    },
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
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status;
        if (!status) return <span className="text-muted-foreground">N/A</span>;
        // Giả sử có 1 map để đổi màu badge theo status
        return (
          <Badge variant={statusVariantMap[status.status] || "outline"}>
            {status.status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <EventActionsCell event={row.original} />,
    },
  ];
}

// components/admin/events/CategoryTableColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/types";
import HighlightedText from "@/components/ui/highlighted-text";
import CategoryActionsCell from "./CategoryActionsCell";

export function categoryColumns(keyword: string): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "name",
      header: "Tên danh mục",
      cell: ({ row }) => (
        <HighlightedText text={row.original.name} keyword={keyword} />
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
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.id}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <CategoryActionsCell category={row.original} />,
    },
  ];
}

// components/admin/users/UserTableColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User, UserRole } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import UserActionsCell from "./UserActionsCell";
import HighlightedText from "@/components/ui/highlighted-text";
import { format, parse } from "date-fns";

// Đổi sang function để nhận keyword
export function userColumns(keyword: string): ColumnDef<User>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tên đăng nhập" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={"/imgs/default-avatar.png"}
                alt={user.username}
              />
              <AvatarFallback>
                {user.username?.substring(0, 2).toUpperCase() || "N/A"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">
              <HighlightedText text={user.username} keyword={keyword} />
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <HighlightedText text={row.original.email} keyword={keyword} />
      ),
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Họ và tên" />
      ),
      cell: ({ row }) =>
        row.original.fullName ? (
          <HighlightedText text={row.original.fullName} keyword={keyword} />
        ) : (
          <span className="text-muted-foreground">N/A</span>
        ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vai trò" />
      ),
      cell: ({ row }) => {
        const userActualRole = row.original.role;
        const effectiveRole = userActualRole || UserRole.USER;

        let badgeVariant: "destructive" | "secondary" | "outline";

        if (effectiveRole === UserRole.ADMIN) {
          badgeVariant = "destructive";
        } else if (effectiveRole === UserRole.ORGANIZER) {
          badgeVariant = "secondary";
        } else {
          badgeVariant = "outline";
        }

        const displayText = effectiveRole.startsWith("ROLE_")
          ? effectiveRole.substring(5)
          : effectiveRole;

        return <Badge variant={badgeVariant}>{displayText}</Badge>;
      },
      filterFn: (row, columnId, filterValue) => {
        const userActualRole = row.original.role;
        const effectiveRole = userActualRole || UserRole.USER;

        return effectiveRole === filterValue;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày tạo" />
      ),
      cell: ({ row }) => {
        const dateStr = row.original.createdAt;
        // Parse LocalDateTime
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
      cell: ({ row }) => <UserActionsCell user={row.original} />,
    },
  ];
}

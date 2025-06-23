// components/admin/users/UserTableColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User, UserRole } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import UserActionsCell from "./UserActionsCell";
import { formatISODate } from "@/lib/utils";

// 1. KHÔNG CẦN TRUYỀN `keyword` VÀO FUNCTION NÀY
// Định nghĩa cột là một hằng số vì nó không thay đổi động
export const userColumns: ColumnDef<User>[] = [
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
      <DataTableColumnHeader column={column} title="Người dùng" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      // 2. SỬ DỤNG AVATAR URL TỪ USER DATA NẾU CÓ
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.avatarUrl || "/imgs/default-avatar.png"} // Ưu tiên avatar của user
              alt={user.username}
            />
            <AvatarFallback>
              {user.username?.substring(0, 2).toUpperCase() || "N/A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {/* Component Highlight có thể lấy keyword từ context hoặc search params */}
              {user.username}
            </span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  // 3. GỘP CỘT USERNAME VÀ EMAIL, BỎ CÁC CỘT DƯ THỪA
  // Cột Email và Họ tên giờ đã được tích hợp vào cột "Người dùng" để giao diện gọn hơn
  // {
  //   accessorKey: "email",
  //   ...
  // },
  // {
  //   accessorKey: "fullName",
  //   ...
  // },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vai trò" />
    ),
    cell: ({ row }) => {
      const role = row.original.role ?? UserRole.USER;

      // 4. CẢI THIỆN LOGIC XỬ LÝ BADGE
      const roleDisplay = {
        [UserRole.ADMIN]: { text: "Admin", variant: "destructive" as const },
        [UserRole.ORGANIZER]: {
          text: "Organizer",
          variant: "secondary" as const,
        },
        [UserRole.USER]: { text: "User", variant: "outline" as const },
      };

      const displayInfo = roleDisplay[role] || roleDisplay[UserRole.USER];

      return <Badge variant={displayInfo.variant}>{displayInfo.text}</Badge>;
    },
    // 5. CẢI THIỆN HÀM FILTER
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false, // Thường không cần sort theo role
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tham gia" />
    ),
    cell: ({ row }) => {
      // 6. SỬ DỤNG HÀM HELPER ĐỂ FORMAT NGÀY THÁNG
      return (
        <div className="text-sm text-muted-foreground">
          {formatISODate(row.original.createdAt, "dd/MM/yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActionsCell user={row.original} />,
  },
];

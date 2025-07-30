// components/admin/AdminSidebarLinks.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Tags,
  Map, // Thêm icon cho Venue
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

// Định nghĩa kiểu nav item, có thêm `roles`
interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[]; // Mảng các vai trò được phép xem link này
}

interface AdminSidebarLinksProps {
  onLinkClick?: () => void; // Prop để đóng sidebar trên mobile
}

// Dữ liệu các link, đã được bổ sung `roles`
const navItems: NavLinkItem[] = [
  {
    href: "/admin/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN, UserRole.ORGANIZER],
  },
  {
    href: "/admin/events",
    label: "Sự kiện",
    icon: CalendarDays,
    roles: [UserRole.ADMIN, UserRole.ORGANIZER],
  },
  {
    href: "/admin/venues",
    label: "Địa điểm",
    icon: Map,
    roles: [UserRole.ADMIN, UserRole.ORGANIZER],
  },
  {
    href: "/admin/users",
    label: "Người dùng",
    icon: Users,
    roles: [UserRole.ADMIN],
  },
  {
    href: "/admin/categories",
    label: "Danh mục",
    icon: Tags,
    roles: [UserRole.ADMIN],
  },
];

const AdminSidebarLinks = ({ onLinkClick }: AdminSidebarLinksProps) => {
  const pathname = usePathname();
  const { user } = useAuth(); // Lấy thông tin người dùng, bao gồm cả vai trò

  // Lọc ra các link mà người dùng hiện tại có quyền xem
  const accessibleLinks = user
    ? navItems.filter((item) => item.roles.includes(user.role))
    : [];

  return (
    <nav aria-label="Admin Sidebar" className="flex-1 space-y-1 p-2">
      {accessibleLinks.map((item) => {
        // SỬA ĐỔI: Dùng startsWith để xử lý các trang con
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminSidebarLinks;

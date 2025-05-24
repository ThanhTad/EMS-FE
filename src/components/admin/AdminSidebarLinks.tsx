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
  type LucideIcon,
} from "lucide-react";

// Định nghĩa kiểu nav item
interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface AdminSidebarLinksProps {
  onLinkClick?: () => void;
}

const navItems: NavLinkItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];

const AdminSidebarLinks = ({ onLinkClick }: AdminSidebarLinksProps) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin Sidebar" className="px-2 text-sm font-medium">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminSidebarLinks;

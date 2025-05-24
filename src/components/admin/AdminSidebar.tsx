// components/admin/AdminSidebar.tsx
import React from "react";
import Link from "next/link";
import { Package2 } from "lucide-react";
import AdminSidebarLinks from "./AdminSidebarLinks";
import { Separator } from "@/components/ui/separator";

const AdminSidebar = () => {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-white dark:bg-gray-800 transition-colors sm:flex"
      role="navigation"
      aria-label="Sidebar"
    >
      <div className="flex h-14 items-center border-b px-4 lg:px-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <Package2 className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Admin EMS
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AdminSidebarLinks />
      </div>
      <Separator />
      <div className="p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} EMS Admin Panel
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;

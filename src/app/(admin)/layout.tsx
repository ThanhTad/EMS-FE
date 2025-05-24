// app/(admin)/layout.tsx
"use client";

import React, { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import { ThemeProvider } from "next-themes";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={true}>
      <ProtectedAdminRoute>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <AdminHeader />
            <main className="flex-1 p-4 pt-6 md:p-6 lg:p-8" role="main">
              {children}
            </main>
          </div>
        </div>
      </ProtectedAdminRoute>
    </ThemeProvider>
  );
}

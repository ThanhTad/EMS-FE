// app/(admin)/categories/new/page.tsx

import { getAndVerifyServerSideUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import CreateCategoryClient from "@/components/admin/categories/CreateCategoryClient"; // Component Client sẽ tạo ngay sau đây
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo Danh mục mới | Admin EMS",
};

// Đây là một Server Component
export default async function AdminCreateCategoryPage() {
  // 1. Bảo vệ route trên server
  const user = await getAndVerifyServerSideUser();
  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/unauthorized");
  }

  // 2. Render component client
  // Không cần truyền props gì vì không có dữ liệu ban đầu
  return <CreateCategoryClient />;
}

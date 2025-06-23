// app/(admin)/categories/page.tsx

import { getCategories } from "@/lib/api";
import { getAndVerifyServerSideUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import CategoriesClient from "@/components/admin/categories/CategoriesClient";
import { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListCollapse } from "lucide-react";

export const metadata: Metadata = {
  title: "Quản lý Danh mục | Admin EMS",
  description: "Thêm, sửa, xóa các danh mục sự kiện.",
};

export default async function AdminCategoriesPage() {
  // 1. Bảo vệ route trên Server
  const user = await getAndVerifyServerSideUser();
  // Chỉ ADMIN mới được quản lý danh mục
  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/unauthorized");
  }

  // 2. Fetch dữ liệu ban đầu trên Server
  try {
    const initialCategoriesData = await getCategories({ size: 1000 }); // Lấy hết

    // 3. Truyền dữ liệu xuống Client Component
    return (
      <CategoriesClient initialCategories={initialCategoriesData.content} />
    );
  } catch (error) {
    console.error("Failed to fetch categories on server:", error);
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <ListCollapse className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải danh sách danh mục từ máy chủ. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}

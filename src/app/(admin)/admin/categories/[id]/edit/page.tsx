// app/(admin)/categories/[id]/edit/page.tsx
import { getCategoryById } from "@/lib/api";
import { getAndVerifyServerSideUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import EditCategoryClient from "@/components/admin/categories/EditCategoryClient"; // Component Client sẽ tạo ngay sau đây
import { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListCollapse } from "lucide-react";

// Metadata động
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const category = await getCategoryById(params.id);
    return { title: `Sửa danh mục: ${category.name} | Admin EMS` };
  } catch {
    return { title: "Sửa danh mục | Admin EMS" };
  }
}

interface AdminEditCategoryPageProps {
  params: { id: string };
}

// Đây là một Server Component
export default async function AdminEditCategoryPage({
  params,
}: AdminEditCategoryPageProps) {
  const categoryId = params.id;

  // 1. Bảo vệ route trên server
  const user = await getAndVerifyServerSideUser();
  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/unauthorized");
  }

  // 2. Fetch dữ liệu ban đầu trên server
  try {
    const initialCategory = await getCategoryById(categoryId);

    // 3. Render component client và truyền dữ liệu xuống
    return <EditCategoryClient initialData={initialCategory} />;
  } catch (error) {
    console.error(`Failed to fetch category ${categoryId}:`, error);
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <ListCollapse className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không tìm thấy danh mục hoặc đã có lỗi xảy ra.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}

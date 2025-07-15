import { getAndVerifyServerSideUser } from "@/lib/session";
import { getUserProfile } from "@/lib/api";
import { UserRole } from "@/types";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import EditUserClient from "@/components/admin/users/EditUserClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Đặt metadata động dựa trên user
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: `Chỉnh sửa Người dùng ID: ${params.id} | Admin EMS`,
  };
}

interface AdminEditUserPageProps {
  params: { id: string };
}

export default async function AdminEditUserPage({
  params,
}: AdminEditUserPageProps) {
  const userId = params.id;

  // 1. KIỂM TRA QUYỀN TRUY CẬP Ở SERVER
  const currentUser = await getAndVerifyServerSideUser();
  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    if (!currentUser)
      redirect(`/login?callbackUrl=/admin/users/${userId}/edit`);
    redirect("/unauthorized");
  }

  // 2. FETCH DỮ LIỆU BAN ĐẦU Ở SERVER
  try {
    const initialUserData = await getUserProfile(userId);

    // Nếu fetch thành công, render Client Component và truyền data vào
    return <EditUserClient initialData={initialUserData} />;
  } catch (error) {
    // 3. XỬ LÝ LỖI FETCH Ở SERVER
    const message =
      error instanceof Error ? error.message : "Không tìm thấy người dùng này.";

    // Nếu có lỗi (e.g., user not found), hiển thị thông báo lỗi ngay lập tức
    return (
      <div className="container mx-auto flex justify-center py-12">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/admin/users">Quay lại danh sách</Link>
          </Button>
        </Alert>
      </div>
    );
  }
}

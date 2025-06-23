// app/(admin)/users/page.tsx
import { adminGetUsers, adminSearchUsers } from "@/lib/api";
import { userColumns } from "@/components/admin/users/UserTableColumns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ServerCrash } from "lucide-react";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton";
import { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { redirect } from "next/navigation";
import { getAndVerifyServerSideUser } from "@/lib/session"; // <-- SỬ DỤNG LẠI HELPER
import { UserRole } from "@/types"; // <-- SỬ DỤNG ENUM

export const metadata: Metadata = {
  title: "Quản lý Người dùng | Admin EMS",
  description: "Xem và quản lý danh sách người dùng hệ thống.",
};

// Interface props chi tiết hơn để code an toàn
interface AdminUsersPageProps {
  searchParams: {
    page?: string;
    size?: string;
    keyword?: string;
    sort?: string;
  };
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  // 1. LẤY VÀ XÁC THỰC USER PHÍA SERVER
  const currentUser = await getAndVerifyServerSideUser();

  // 2. KIỂM TRA QUYỀN TRUY CẬP NGHIÊM NGẶT
  // Chỉ ADMIN mới được vào trang này
  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    // Nếu chưa đăng nhập, chuyển đến trang login
    if (!currentUser) {
      redirect("/login?callbackUrl=/admin/users");
    }
    // Nếu đã đăng nhập nhưng không có quyền, chuyển đến trang "không có quyền"
    redirect("/unauthorized");
  }

  // 3. LOGIC HIỂN THỊ NÚT TẠO MỚI (CHỈ ADMIN)
  const canCreateUser = currentUser.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý Người dùng</h1>
        {canCreateUser && (
          <Button asChild>
            <Link href="/admin/users/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm người dùng mới
            </Link>
          </Button>
        )}
      </div>

      <Suspense
        // 4. THÊM KEY VÀO SUSPENSE ĐỂ ĐẢM BẢO RE-RENDER ĐÚNG
        key={
          searchParams.page ||
          "1" + searchParams.size ||
          "10" + searchParams.keyword
        }
        fallback={
          <DataTableSkeleton
            // 5. ĐƠN GIẢN HÓA PROPS
            columnCount={userColumns.length}
            rowCount={Number(searchParams.size) || 10}
          />
        }
      >
        <UsersTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Đổi tên component để rõ ràng hơn vai trò của nó
async function UsersTableWrapper({ searchParams }: AdminUsersPageProps) {
  const page = Math.max(0, Number(searchParams.page ?? "1") - 1);
  const size = Math.max(1, Number(searchParams.size ?? "10"));
  const keyword = searchParams.keyword;
  const sort = searchParams.sort;

  try {
    const usersData = keyword
      ? await adminSearchUsers({ page, size, sort, keyword })
      : await adminGetUsers({ page, size, sort });

    return (
      <DataTable
        // 5. ĐƠN GIẢN HÓA PROPS: userColumns không cần biết về keyword
        columns={userColumns}
        data={usersData.content ?? []}
        pageCount={usersData.totalPages ?? 0}
        totalRecords={usersData.totalElements ?? 0}
      />
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
    console.error("Failed to fetch users for admin:", errorMessage);

    return (
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Lỗi tải dữ liệu người dùng</AlertTitle>
        <AlertDescription>
          Không thể tải danh sách người dùng. Chi tiết: {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }
}

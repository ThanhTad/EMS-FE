// app/(admin)/users/page.tsx
import { adminGetUsers, adminSearchUsers } from "@/lib/api";
import { userColumns } from "@/components/admin/users/UserTableColumns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ServerCrash } from "lucide-react";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Quản lý Người dùng | Admin EMS",
  description: "Xem và quản lý danh sách người dùng hệ thống.",
};

interface AdminUsersPageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("ems_auth_token");
  const token = tokenCookie?.value;

  if (!token) {
    // Redirect user to login if token is missing
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-100">
          Quản lý Người dùng
        </h1>
        <Button asChild>
          <Link href="/admin/users/new">
            <PlusCircle className="mr-2 h-4 w-4 dark:text-gray-300" /> Thêm
            người dùng mới
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={userColumns("").length}
            rowCount={10}
          />
        }
      >
        <UsersTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function UsersTable({ searchParams }: AdminUsersPageProps) {
  // 1-based page in URL -> convert to 0-based
  const pageParam = Number(searchParams.page ?? "1") - 1;
  const sizeParam = Number(searchParams.size ?? "10");
  const keyword = searchParams.keyword;
  const sort = searchParams.sort;

  try {
    const usersData = keyword
      ? await adminSearchUsers({
          page: pageParam,
          size: sizeParam,
          sort,
          keyword,
        })
      : await adminGetUsers({
          page: pageParam,
          size: sizeParam,
          sort,
        });

    return (
      <DataTable
        columns={userColumns(keyword ?? "")}
        data={usersData.content}
        pageCount={usersData.totalPages}
        totalRecords={usersData.totalElements}
      />
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch users for admin:", error.message);
    } else {
      console.error("Unknown error: ", error);
    }

    return (
      <Alert
        variant="destructive"
        className="dark:bg-gray-800 dark:text-gray-200"
      >
        <ServerCrash className="h-4 w-4 dark:text-red-500" />
        <AlertTitle className="dark:text-gray-100">
          Lỗi tải dữ liệu người dùng
        </AlertTitle>
        <AlertDescription className="dark:text-gray-300">
          Không thể tải danh sách người dùng. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }
}

// app/(admin)/events/page.tsx
import { getEvents, adminSearchEvents, getCurrentUserInfo } from "@/lib/api";
import { eventColumns } from "@/components/admin/events/EventTableColumns";
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
import { User } from "@/types";

export const metadata: Metadata = {
  title: "Quản lý Sự kiện | Admin EMS",
  description: "Xem và quản lý danh sách sự kiện.",
};

interface AdminEventsPageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("ems_auth_token");
  const token = tokenCookie?.value;

  if (!token) redirect("/login");

  // Lấy thông tin user hiện tại
  let currentUser: User & { role: string };
  try {
    currentUser = await getCurrentUserInfo();
  } catch (e) {
    console.error(e);
    redirect("/login");
  }

  // Hiển thị nút tạo mới nếu có quyền
  const canCreateEvent =
    currentUser.role === "ROLE_ADMIN" || currentUser.role === "ROLE_ORGANIZER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-100">
          Quản lý Sự kiện
        </h1>
        {canCreateEvent && (
          <Button asChild>
            <Link href="/admin/events/new">
              <PlusCircle className="mr-2 h-4 w-4 dark:text-gray-300" /> Thêm sự
              kiện mới
            </Link>
          </Button>
        )}
      </div>

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={eventColumns("").length}
            rowCount={10}
          />
        }
      >
        <EventsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function EventsTable({ searchParams }: AdminEventsPageProps) {
  const pageParam = Number(searchParams.page ?? "1") - 1;
  const sizeParam = Number(searchParams.size ?? "10");
  const keyword = searchParams.keyword;
  const sort = searchParams.sort;

  try {
    const eventsData = keyword
      ? await adminSearchEvents({
          page: pageParam,
          size: sizeParam,
          sort,
          keyword,
        })
      : await getEvents({
          page: pageParam,
          size: sizeParam,
          sort,
        });

    // Nếu muốn hiện tên người tạo, FE nên lấy thêm danh sách moderator và truyền vào columns
    // Ở đây giả sử chỉ hiện id hoặc đã custom columns riêng

    return (
      <DataTable
        columns={eventColumns(keyword ?? "")}
        data={eventsData.content}
        pageCount={eventsData.totalPages}
        totalRecords={eventsData.totalElements}
      />
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch events for admin:", error.message);
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
          Lỗi tải dữ liệu sự kiện
        </AlertTitle>
        <AlertDescription className="dark:text-gray-300">
          Không thể tải danh sách sự kiện. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }
}

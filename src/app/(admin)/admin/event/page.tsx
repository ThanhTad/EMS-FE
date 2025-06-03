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
import { AuthResponse } from "@/types";

export const metadata: Metadata = {
  title: "Quản lý Sự kiện | Admin EMS",
  description: "Xem và quản lý danh sách sự kiện.",
};

interface AdminEventsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  // Await searchParams since it's a Promise in newer Next.js versions
  const resolvedSearchParams = await searchParams;

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("ems_auth_token");
  const token = tokenCookie?.value;

  if (!token) {
    redirect("/login");
  }

  // Lấy thông tin user hiện tại
  let authResponse: AuthResponse;
  try {
    authResponse = await getCurrentUserInfo();
  } catch (error) {
    console.error("Error getting current user info:", error);
    redirect("/login");
  }

  if (!authResponse.user) {
    console.error("No user information found in auth response.");
    redirect("/login");
  }

  const currentUser = authResponse.user;
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
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm sự kiện mới
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
        <EventsTable searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}

interface EventsTableProps {
  searchParams: Record<string, string | undefined>;
}

async function EventsTable({ searchParams }: EventsTableProps) {
  const pageParam = Math.max(0, Number(searchParams.page ?? "1") - 1);
  const sizeParam = Math.max(1, Number(searchParams.size ?? "10"));
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

    return (
      <DataTable
        columns={eventColumns(keyword ?? "")}
        data={eventsData.content ?? []}
        pageCount={eventsData.totalPages ?? 0}
        totalRecords={eventsData.totalElements ?? 0}
      />
    );
  } catch (error) {
    console.error("Failed to fetch events for admin:", error);

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

// app/(admin)/events/page.tsx
import { adminGetEvents, searchEvents } from "@/lib/api";
import { eventColumns } from "@/components/admin/events/EventTableColumns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ServerCrash } from "lucide-react";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton";
import { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { redirect } from "next/navigation";
import { getAndVerifyServerSideUser } from "@/lib/session"; // <-- THAY ĐỔI QUAN TRỌNG
import { UserRole } from "@/types";

export const metadata: Metadata = {
  title: "Quản lý Sự kiện | Admin EMS",
  description: "Xem và quản lý danh sách sự kiện.",
};

// Props interface không cần Promise nữa
interface AdminEventsPageProps {
  searchParams: {
    page?: string;
    size?: string;
    keyword?: string;
    sort?: string;
  };
}

export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  // 1. SỬ DỤNG HÀM HELPER ĐỂ LẤY USER PHÍA SERVER
  const currentUser = await getAndVerifyServerSideUser();

  // 2. KIỂM TRA XÁC THỰC VÀ PHÂN QUYỀN GỌN GÀNG
  if (!currentUser) {
    redirect("/login?callbackUrl=/admin/events"); // Thêm callbackUrl để UX tốt hơn
  }

  const canAccessAdmin =
    currentUser.role === UserRole.ADMIN ||
    currentUser.role === UserRole.ORGANIZER;

  if (!canAccessAdmin) {
    redirect("/unauthorized"); // Hoặc redirect về trang chủ
  }

  // 3. LOGIC HIỂN THỊ NÚT TẠO MỚI
  // Giả sử chỉ ADMIN hoặc ORGANIZER được tạo
  const canCreateEvent =
    currentUser.role === UserRole.ADMIN ||
    currentUser.role === UserRole.ORGANIZER;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý Sự kiện</h1>
        {canCreateEvent && (
          <Button asChild>
            <Link href="/admin/events/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm sự kiện mới
            </Link>
          </Button>
        )}
      </div>

      {/* 4. PASS PROPS TRỰC TIẾP, KHÔNG CẦN COMPONENT LỒNG NHAU KHÔNG CẦN THIẾT */}
      <Suspense
        key={`${searchParams.keyword ?? ""}-${searchParams.page ?? 1}-${
          searchParams.size ?? 10
        }`}
        fallback={
          <DataTableSkeleton
            columnCount={eventColumns.length} // Không cần truyền keyword
            rowCount={Number(searchParams.size) || 10}
          />
        }
      >
        <EventsTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Giữ lại component này để tận dụng Suspense
async function EventsTableWrapper({
  searchParams,
}: {
  searchParams: AdminEventsPageProps["searchParams"];
}) {
  const page = Math.max(0, Number(searchParams.page ?? "1") - 1);
  const size = Math.max(1, Number(searchParams.size ?? "10"));
  const keyword = searchParams.keyword;
  const sort = searchParams.sort;

  try {
    // 5. SỬ DỤNG CÁC HÀM API DÀNH RIÊNG CHO ADMIN
    const eventsData = keyword
      ? await searchEvents({ page, size, sort, keyword })
      : await adminGetEvents({ page, size, sort });

    return (
      <DataTable
        columns={eventColumns} // Không cần truyền keyword vào đây
        data={eventsData.content ?? []}
        pageCount={eventsData.totalPages ?? 0}
        totalRecords={eventsData.totalElements ?? 0}
      />
    );
  } catch (error) {
    // 6. XỬ LÝ LỖI MẠNH MẼ HƠN
    let errorMessage = "Không thể tải danh sách sự kiện. Vui lòng thử lại sau.";
    if (error instanceof Error) {
      // Bạn có thể check các loại lỗi cụ thể ở đây
      // Ví dụ: if (error.message.includes('Unauthorized'))
      errorMessage = `Đã xảy ra lỗi: ${error.message}`;
    }

    return (
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }
}

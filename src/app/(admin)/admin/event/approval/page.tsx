//app/(admin)/admin/event/approval/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UserRole } from "@/types";
import { getAndVerifyServerSideUser } from "@/lib/session";
import { adminGetEventsByStatus } from "@/lib/api"; // <-- API mới
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton";
import ApprovalEventTable from "@/components/admin/events/approval/ApprovalEventTable";
import { approvalTableColumns } from "@/components/admin/events/approval/ApprovalTableColumns";

export const metadata: Metadata = {
  title: "Duyệt Sự kiện | Admin EMS",
  description: "Xem và duyệt các sự kiện đang chờ.",
};

interface Props {
  searchParams: {
    page?: string;
    size?: string;
  };
}

export default async function EventApprovalPage({ searchParams }: Props) {
  // 1. Xác thực quyền Admin
  const currentUser = await getAndVerifyServerSideUser();
  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    redirect("/unauthorized");
  }

  // 2. Fetch dữ liệu trên Server
  const page = Number(searchParams.page ?? "1") - 1;
  const size = Number(searchParams.size ?? "10");

  // Gọi API mới để chỉ lấy sự kiện có trạng thái PENDING_APPROVAL
  const pendingEventsData = await adminGetEventsByStatus("PENDING_APPROVAL", {
    page,
    size,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Duyệt Sự kiện</h1>
        <p className="text-muted-foreground">
          Có {pendingEventsData.totalElements} sự kiện đang chờ duyệt
        </p>
      </div>

      {/* 3. Dùng Suspense để có trải nghiệm tải trang tốt hơn */}
      <Suspense
        key={page + "" + size}
        fallback={
          <DataTableSkeleton
            columnCount={approvalTableColumns.length}
            rowCount={size}
          />
        }
      >
        <ApprovalEventTable eventsData={pendingEventsData} />
      </Suspense>
    </div>
  );
}

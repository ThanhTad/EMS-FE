// app/(admin)/tickets/page.tsx
import { adminGetEvents, adminGetTickets, getAllStatuses } from "@/lib/api";
import { getAndVerifyServerSideUser } from "@/lib/session";
import { ticketColumns } from "@/components/admin/tickets/TicketTableColumns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ServerCrash } from "lucide-react";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton";
import { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { redirect } from "next/navigation";
import { Event, StatusCode, UserRole } from "@/types";
import { TicketsFilter } from "@/components/admin/tickets/TicketsFilter";

export const metadata: Metadata = {
  title: "Quản lý Vé | Admin EMS",
  description: "Xem và quản lý danh sách vé của các sự kiện.",
};

interface AdminTicketsPageProps {
  searchParams: {
    page?: string;
    size?: string;
    sort?: string;
    eventId?: string;
    statusId?: string;
  };
}

export default async function AdminTicketsPage({
  searchParams,
}: AdminTicketsPageProps) {
  // 1. BẢO MẬT VÀ LẤY THÔNG TIN USER
  const currentUser = await getAndVerifyServerSideUser();
  if (!currentUser) {
    redirect("/login?callbackUrl=/admin/tickets");
  }

  const canAccessPage =
    currentUser.role === UserRole.ADMIN ||
    currentUser.role === UserRole.ORGANIZER;
  if (!canAccessPage) {
    redirect("/unauthorized");
  }

  // 2. LỌC DỮ LIỆU DỰA TRÊN VAI TRÒ
  const filterOrganizerId =
    currentUser.role === UserRole.ORGANIZER ? currentUser.id : undefined;

  // 3. FETCH DỮ LIỆU SONG SONG
  const [eventsData, statusesData, ticketsData] = await Promise.all([
    adminGetEvents({ organizerId: filterOrganizerId, size: 1000 }),
    getAllStatuses(),
    adminGetTickets({
      page: Math.max(0, Number(searchParams.page ?? "1") - 1),
      size: Math.max(1, Number(searchParams.size ?? "10")),
      sort: searchParams.sort,
      eventId: searchParams.eventId,
      statusId: searchParams.statusId,
      organizerId: filterOrganizerId, // TRUYỀN ID VÀO API ĐỂ LỌC
    }),
  ]).catch((error) => {
    console.error("Failed to fetch tickets page data:", error);
    return [null, null, null];
  });

  // 4. XỬ LÝ LỖI FETCH
  if (!eventsData || !statusesData || !ticketsData) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>
            Không thể tải dữ liệu cần thiết cho trang quản lý vé. Vui lòng thử
            lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 5. CHUẨN BỊ DỮ LIỆU CHO BỘ LỌC
  const eventOptions = eventsData.content.map((e: Event) => ({
    value: e.id,
    label: e.title,
  }));
  const statusOptions = statusesData
    .filter((s: StatusCode) => s.entityType === "TICKET")
    .map((s: StatusCode) => ({ value: String(s.id), label: s.status }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý Vé</h1>
        <Button asChild>
          <Link href="/admin/tickets/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm vé mới
          </Link>
        </Button>
      </div>

      <TicketsFilter
        eventOptions={eventOptions}
        statusOptions={statusOptions}
      />

      <Suspense
        key={JSON.stringify(searchParams)}
        fallback={<DataTableSkeleton columnCount={ticketColumns.length} />}
      >
        <DataTable
          columns={ticketColumns}
          data={ticketsData.content}
          pageCount={ticketsData.totalPages}
          totalRecords={ticketsData.totalElements}
        />
      </Suspense>
    </div>
  );
}

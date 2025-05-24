// app/(admin)/tickets/page.tsx
import {
  getEvents,
  adminGetTicketsByEventId,
  adminGetTicketsByStatusId,
  getAllStatuses,
  getCurrentUserInfo,
  getTickets,
} from "@/lib/api";
import { ticketColumns } from "@/components/admin/tickets/TicketTableColumns";
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
import { User, Event } from "@/types";

export const metadata: Metadata = {
  title: "Quản lý Vé | Admin EMS",
  description: "Xem và quản lý danh sách vé.",
};

interface AdminTicketsPageProps {
  searchParams: Record<string, string | undefined>;
}

function TicketsFilter({
  eventOptions,
  statusOptions,
  currentFilters,
}: {
  eventOptions: { id: string; name: string }[];
  statusOptions: { id: number; name: string }[];
  currentFilters: { eventId?: string; statusId?: string };
}) {
  // Khi thay đổi filter, update URL param
  return (
    <div className="flex gap-4 mb-4">
      <div>
        <label className="block text-xs font-medium mb-1">Sự kiện</label>
        <select
          className="border rounded px-2 py-2"
          value={currentFilters.eventId ?? ""}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.value) params.set("eventId", e.target.value);
            else params.delete("eventId");
            params.delete("page"); // reset page về 1
            window.location.search = params.toString();
          }}
        >
          <option value="">Tất cả</option>
          {eventOptions.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Trạng thái</label>
        <select
          className="border rounded px-2 py-2"
          value={currentFilters.statusId ?? ""}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.value) params.set("statusId", e.target.value);
            else params.delete("statusId");
            params.delete("page"); // reset page về 1
            window.location.search = params.toString();
          }}
        >
          <option value="">Tất cả</option>
          {statusOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default async function AdminTicketsPage({
  searchParams,
}: AdminTicketsPageProps) {
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

  // Lấy danh sách sự kiện và trạng thái
  const eventsData = await getEvents({ page: 0, size: 1000 });
  const statusesData = await getAllStatuses();
  const eventOptions = (eventsData?.content ?? []).map((e: Event) => ({
    id: e.id,
    name: e.title,
  }));
  const statusOptions = (statusesData ?? [])
    .filter((s: { entityType: string }) => s.entityType === "TICKET")
    .map((s: { id: number; status: string }) => ({
      id: s.id,
      name: s.status,
    }));
  const eventIdToName = Object.fromEntries(
    eventOptions.map((e) => [e.id, e.name])
  );
  const eventIdToCreatorId: Record<string, string> = Object.fromEntries(
    (eventsData?.content ?? [])
      .filter((e: Event) => !!e.organizer && typeof e.organizer.id === "string")
      .map((e: Event) => [e.id, e.organizer.id])
  );

  // Hiển thị nút tạo mới nếu có quyền
  const canCreateTicket =
    currentUser.role === "ROLE_ADMIN" || currentUser.role === "ROLE_ORGANIZER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-100">
          Quản lý Vé
        </h1>
        {canCreateTicket && (
          <Button asChild>
            <Link href="/admin/tickets/new">
              <PlusCircle className="mr-2 h-4 w-4 dark:text-gray-300" /> Thêm vé
              mới
            </Link>
          </Button>
        )}
      </div>
      <TicketsFilter
        eventOptions={eventOptions}
        statusOptions={statusOptions}
        currentFilters={{
          eventId: searchParams.eventId,
          statusId: searchParams.statusId,
        }}
      />
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={
              ticketColumns("", eventIdToName, currentUser, eventIdToCreatorId)
                .length
            }
            rowCount={10}
          />
        }
      >
        <TicketsTable
          searchParams={searchParams}
          token={token}
          eventIdToName={eventIdToName}
          currentUser={currentUser}
          eventIdToCreatorId={eventIdToCreatorId}
        />
      </Suspense>
    </div>
  );
}

async function TicketsTable({
  searchParams,
  eventIdToName,
  currentUser,
  eventIdToCreatorId,
}: AdminTicketsPageProps & {
  token: string;
  eventIdToName: Record<string, string>;
  currentUser: User & { role: string };
  eventIdToCreatorId: Record<string, string>;
}) {
  const pageParam = Number(searchParams.page ?? "1") - 1;
  const sizeParam = Number(searchParams.size ?? "10");
  const sort = searchParams.sort;
  const eventId = searchParams.eventId;
  const statusId = searchParams.statusId;

  try {
    let ticketsData;
    if (eventId) {
      ticketsData = await adminGetTicketsByEventId(eventId, {
        page: pageParam,
        size: sizeParam,
      });
    } else if (statusId) {
      ticketsData = await adminGetTicketsByStatusId(Number(statusId), {
        page: pageParam,
        size: sizeParam,
      });
    } else {
      ticketsData = await getTickets({
        page: pageParam,
        size: sizeParam,
        sort,
      });
    }

    return (
      <DataTable
        columns={ticketColumns(
          "",
          eventIdToName,
          currentUser,
          eventIdToCreatorId
        )}
        data={ticketsData.content}
        pageCount={ticketsData.totalPages}
        totalRecords={ticketsData.totalElements}
      />
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch tickets for admin:", error.message);
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
          Lỗi tải dữ liệu vé
        </AlertTitle>
        <AlertDescription className="dark:text-gray-300">
          Không thể tải danh sách vé. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }
}

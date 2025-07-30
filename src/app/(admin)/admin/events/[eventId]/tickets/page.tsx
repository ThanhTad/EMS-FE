import { adminGetTicketsByEvent, getEventById } from "@/lib/api"; // API đúng
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
import { UserRole } from "@/types";
import { toast } from "sonner";

// Metadata động
export async function generateMetadata({
  params,
}: {
  params: { eventId: string };
}): Promise<Metadata> {
  try {
    const event = await getEventById(params.eventId); // API lấy chi tiết sự kiện
    return {
      title: `Vé cho: ${event.title} | Admin EMS`,
      description: `Quản lý vé cho sự kiện ${event.title}.`,
    };
  } catch (error) {
    if (error instanceof Error) {
      toast.error(`Lỗi khi lấy thông tin sự kiện: ${error.message}`);
    }
    return {
      title: "Quản lý Vé | Admin EMS",
    };
  }
}

interface AdminEventTicketsPageProps {
  params: { eventId: string };
  searchParams: {
    page?: string;
    size?: string;
    sort?: string;
  };
}

export default async function AdminEventTicketsPage({
  params,
  searchParams,
}: AdminEventTicketsPageProps) {
  const { eventId } = params;

  // 1. BẢO MẬT VÀ LẤY THÔNG TIN USER (giữ nguyên)
  const currentUser = await getAndVerifyServerSideUser();
  if (!currentUser) {
    redirect(`/login?callbackUrl=/admin/events/${eventId}/tickets`);
  }
  const canAccessPage =
    currentUser.role === UserRole.ADMIN ||
    currentUser.role === UserRole.ORGANIZER;
  if (!canAccessPage) {
    redirect("/unauthorized");
  }

  // 2. FETCH DỮ LIỆU
  // Không cần Promise.all nữa vì logic đơn giản hơn
  try {
    const eventData = await getEventById(eventId);

    // TODO: Kiểm tra quyền sở hữu cho Organizer
    // if (currentUser.role === UserRole.ORGANIZER && eventData.creator?.id !== currentUser.id) {
    //   redirect("/unauthorized");
    // }

    const ticketsData = await adminGetTicketsByEvent(eventId, {
      page: Math.max(0, Number(searchParams.page ?? "1") - 1),
      size: Math.max(1, Number(searchParams.size ?? "10")),
      sort: searchParams.sort,
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Quản lý vé cho sự kiện
            </p>
            <h1 className="text-2xl font-semibold">{eventData.title}</h1>
          </div>
          <Button asChild>
            {/* Link tạo vé mới cũng cần eventId */}
            <Link href={`/admin/events/${eventId}/tickets/new`}>
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm vé mới
            </Link>
          </Button>
        </div>

        {/* Bộ lọc có thể được thêm ở đây nếu cần, nhưng đơn giản hơn */}
        {/* <TicketsFilter statusOptions={...} /> */}

        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={<DataTableSkeleton columnCount={5} />}
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
  } catch (error) {
    console.error("Failed to fetch event tickets page data:", error);
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>
            Không thể tải dữ liệu vé cho sự kiện này. Sự kiện có thể không tồn
            tại hoặc đã xảy ra lỗi.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}

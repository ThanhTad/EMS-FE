// app/(admin)/tickets/[id]/edit/page.tsx
import React from "react";
import Link from "next/link";
import { ServerCrash } from "lucide-react";
import {
  getTicketsById,
  getEvents,
  getAllStatuses,
  getSectionsForEvent, // <-- API mới cần thiết
} from "@/lib/api";
import { StatusCode, TicketSelectionModeEnum } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import AdminEditTicketClient from "@/components/admin/tickets/AdminEditTicketClient";
import TicketFormSkeleton from "@/components/shared/TicketFormSkeleton";

type SelectOption = { value: string; label: string };

interface PageProps {
  params: { id: string };
}

// Đây là một Server Component bất đồng bộ
export default async function AdminEditTicketPage({ params }: PageProps) {
  const ticketId = params.id;

  // Sử dụng Suspense để hiển thị skeleton trong khi dữ liệu đang được fetch
  // Điều này cho phép trang render ngay lập tức và stream nội dung vào.
  return (
    <React.Suspense fallback={<TicketFormSkeleton />}>
      <EditTicketDataLoader ticketId={ticketId} />
    </React.Suspense>
  );
}

// Component con này cũng là Server Component để xử lý logic fetching
async function EditTicketDataLoader({ ticketId }: { ticketId: string }) {
  try {
    // Fetch tất cả dữ liệu cần thiết song song
    const [ticket, eventsPage, allStatuses] = await Promise.all([
      getTicketsById(ticketId),
      getEvents({ page: 0, size: 1000 }), // Vẫn cần xem xét combobox search cho tương lai
      getAllStatuses(),
    ]);

    // Nếu không có vé, hiển thị lỗi ngay
    if (!ticket) {
      throw new Error(`Không tìm thấy vé với ID: ${ticketId}`);
    }

    // Fetch danh sách sections cho sự kiện hiện tại của vé
    let initialSectionOptions: SelectOption[] = [];
    if (
      ticket.eventId &&
      ticket.ticketSelectionMode === TicketSelectionModeEnum.SEATED
    ) {
      const sections = await getSectionsForEvent(ticket.eventId);
      initialSectionOptions = sections.map((section) => ({
        value: section.id,
        label: section.name,
      }));
    }

    // Chuẩn bị các options cho dropdowns
    const eventOptions: SelectOption[] = eventsPage.content.map((e) => ({
      value: e.id,
      label: e.title,
    }));

    const statusOptions: SelectOption[] = allStatuses
      .filter((s: StatusCode) => s.entityType === "TICKET")
      .map((s: StatusCode) => ({
        value: String(s.id),
        label: s.status,
      }));

    // Truyền tất cả dữ liệu đã được chuẩn bị xuống Client Component
    return (
      <AdminEditTicketClient
        initialTicketData={ticket}
        eventOptions={eventOptions}
        statusOptions={statusOptions}
        initialSectionOptions={initialSectionOptions}
      />
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định.";
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/admin/tickets">Quay lại danh sách</Link>
          </Button>
        </Alert>
      </div>
    );
  }
}

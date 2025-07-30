import React from "react";
import Link from "next/link";
import { ServerCrash } from "lucide-react";
import { getTicketsById, getAllStatuses, getEventById } from "@/lib/api";
import { StatusCode } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import AdminEditTicketClient from "@/components/admin/tickets/AdminEditTicketClient";
import TicketFormSkeleton from "@/components/shared/TicketFormSkeleton";
import { Metadata } from "next";

type SelectOption = { value: string; label: string };

interface PageProps {
  params: {
    eventId: string;
    ticketId: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const ticket = await getTicketsById(params.ticketId);
    return { title: `Chỉnh sửa vé: ${ticket.name}` };
  } catch {
    return { title: "Chỉnh sửa vé" };
  }
}

export default async function AdminEditTicketPage({ params }: PageProps) {
  const { eventId, ticketId } = params;

  return (
    <React.Suspense fallback={<TicketFormSkeleton />}>
      <EditTicketDataLoader eventId={eventId} ticketId={ticketId} />
    </React.Suspense>
  );
}

async function EditTicketDataLoader({
  eventId,
  ticketId,
}: {
  eventId: string;
  ticketId: string;
}) {
  try {
    // Fetch dữ liệu cần thiết song song
    const [ticket, event, allStatuses] = await Promise.all([
      getTicketsById(ticketId),
      getEventById(eventId),
      getAllStatuses(),
    ]);

    if (!ticket) {
      throw new Error(`Không tìm thấy vé với ID: ${ticketId}`);
    }
    // (Optional) Kiểm tra xem vé có thực sự thuộc sự kiện không
    if (ticket.eventId !== eventId) {
      throw new Error("Lỗi: Vé này không thuộc sự kiện đang thao tác.");
    }

    const statusOptions: SelectOption[] = allStatuses
      .filter((s: StatusCode) => s.entityType === "TICKET")
      .map((s: StatusCode) => ({ value: String(s.id), label: s.status }));

    const sectionOptions: SelectOption[] =
      event.seatMap?.sections?.map((section) => ({
        value: section.id,
        label: section.name,
      })) || [];

    return (
      <AdminEditTicketClient
        event={event}
        initialTicketData={ticket}
        statusOptions={statusOptions}
        sectionOptions={sectionOptions}
      />
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định.";
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
          <Button variant="outline" asChild className="mt-4">
            {/* Sửa link quay lại */}
            <Link href={`/admin/events/${eventId}/tickets`}>
              Quay lại danh sách vé
            </Link>
          </Button>
        </Alert>
      </div>
    );
  }
}

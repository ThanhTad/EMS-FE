import React from "react";
import { getAllStatuses, getEventById } from "@/lib/api";
import { StatusCode } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";
import AdminCreateTicketClient from "@/components/admin/tickets/AdminCreateTicketClient";
import { Metadata } from "next";

type SelectOption = { value: string; label: string };

interface PageProps {
  params: { eventId: string };
}

// Metadata động
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const event = await getEventById(params.eventId);
    return { title: `Tạo vé mới cho: ${event.title}` };
  } catch {
    return { title: "Tạo vé mới" };
  }
}

export default async function AdminCreateTicketPage({ params }: PageProps) {
  const { eventId } = params;

  try {
    // Chỉ cần fetch sự kiện hiện tại và các status
    const [event, allStatuses] = await Promise.all([
      getEventById(eventId),
      getAllStatuses(),
    ]);

    const statusOptions: SelectOption[] = allStatuses
      .filter((s: StatusCode) => s.entityType === "TICKET")
      .map((s: StatusCode) => ({ value: String(s.id), label: s.status }));

    // Lấy section options từ event đã fetch
    const sectionOptions: SelectOption[] =
      event.seatMap?.sections?.map((section) => ({
        value: section.id,
        label: section.name,
      })) || [];

    return (
      <AdminCreateTicketClient
        event={event}
        statusOptions={statusOptions}
        sectionOptions={sectionOptions}
      />
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định.";
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }
}

// app/(admin)/tickets/new/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import TicketForm from "@/components/admin/tickets/TicketForm";
import { adminCreateTicket, getEvents, getAllStatuses } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Event, CreateTicketRequest, StatusCode } from "@/types";

export default function AdminCreateTicketPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [eventOptions, setEventOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [statusOptions, setStatusOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [eventsPage, allStatuses] = await Promise.all([
          getEvents({ page: 0, size: 1000 }),
          getAllStatuses(),
        ]);

        setEventOptions(
          eventsPage.content.map((e: Event) => ({ id: e.id, name: e.title }))
        );

        setStatusOptions(
          allStatuses
            .filter((s: StatusCode) => s.entityType === "TICKET")
            .map((s: StatusCode) => ({ id: s.id, name: s.status }))
        );
      } catch (e: unknown) {
        if (e instanceof Error) {
          toast.error("Không thể tải danh sách sự kiện hoặc trạng thái vé.");
        }
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleCreateTicket = async (data: CreateTicketRequest) => {
    setIsLoading(true);
    try {
      await adminCreateTicket(data);
      toast.success("Thành công", {
        description: `Vé "${data.ticketType}" đã được tạo.`,
      });
      router.push("/admin/tickets");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tạo vé mới.";
      toast.error("Tạo thất bại", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <TicketForm
        onSubmit={handleCreateTicket}
        isLoading={isLoading || loadingOptions}
        isEditMode={false}
        eventOptions={eventOptions}
        statusOptions={statusOptions}
      />
    </div>
  );
}

// components/admin/tickets/AdminEditTicketClient.tsx
"use client";

import React, { useState } from "react";
import TicketForm from "@/components/admin/tickets/TicketForm";
import { adminUpdateTicket } from "@/lib/api";
import { Ticket, UpdateTicketRequest, Event } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SelectOption = { value: string; label: string };

interface AdminEditTicketClientProps {
  event: Event; // <<<< THAY ĐỔI: Nhận object Event
  initialTicketData: Ticket;
  statusOptions: SelectOption[];
  sectionOptions: SelectOption[];
}

export default function AdminEditTicketClient({
  event,
  initialTicketData,
  statusOptions,
  sectionOptions,
}: AdminEditTicketClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Không cần handleEventChange

  const handleUpdateTicket = async (data: UpdateTicketRequest) => {
    setIsSubmitting(true);
    try {
      const payload: UpdateTicketRequest = {
        ...data,
        price: Number(data.price),
        statusId: Number(data.statusId),
        appliesToSectionId: data.appliesToSectionId || undefined,
        totalQuantity: data.totalQuantity
          ? Number(data.totalQuantity)
          : undefined,
        maxPerPurchase: data.maxPerPurchase
          ? Number(data.maxPerPurchase)
          : undefined,
      };

      // Gọi API mới, truyền event.id và ticket.id
      await adminUpdateTicket(event.id, initialTicketData.id, payload);

      toast.success("Cập nhật thành công!", {
        description: "Thông tin vé đã được cập nhật.",
      });

      // Chuyển hướng về đúng trang
      router.push(`/admin/events/${event.id}/tickets`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật vé.";
      toast.error("Cập nhật thất bại", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chuẩn bị dữ liệu ban đầu cho form
  const formInitialData = {
    ...initialTicketData,
    statusId: initialTicketData.statusId ?? 0,
    // Đảm bảo eventId được gán đúng từ event prop
    eventId: event.id,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa vé</h1>
        <p className="text-muted-foreground">
          Cập nhật thông tin chi tiết cho vé:{" "}
          <span className="font-semibold">{initialTicketData.name}</span>
        </p>
      </div>

      <TicketForm
        initialData={formInitialData}
        onSubmit={handleUpdateTicket}
        isLoading={isSubmitting}
        isEditMode={true}
        event={event} // <<<< THAY ĐỔI: Truyền object event
        statusOptions={statusOptions}
        sectionOptions={sectionOptions}
      />
    </div>
  );
}

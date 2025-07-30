// components/admin/tickets/AdminCreateTicketClient.tsx (phiên bản cuối cùng)
"use client";

import React, { useState } from "react";
import TicketForm from "@/components/admin/tickets/TicketForm";
import { adminCreateTicket } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateTicketRequest, Event } from "@/types";

type SelectOption = { value: string; label: string };

interface AdminCreateTicketClientProps {
  event: Event; // <<<< THAY ĐỔI: Nhận vào object Event đầy đủ
  statusOptions: SelectOption[];
  sectionOptions: SelectOption[];
}

export default function AdminCreateTicketClient({
  event,
  statusOptions,
  sectionOptions,
}: AdminCreateTicketClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Không cần handleEventChange nữa vì event đã cố định.

  const handleCreateTicket = async (
    data: Omit<CreateTicketRequest, "eventId">
  ) => {
    setIsSubmitting(true);
    try {
      // Chuyển đổi kiểu dữ liệu (logic này vẫn đúng)
      const payload = {
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

      // Gọi API mới, truyền event.id vào
      const newTicket = await adminCreateTicket(event.id, payload);

      toast.success("Tạo vé thành công!", {
        description: `Vé "${newTicket.name}" đã được tạo cho sự kiện "${event.title}".`,
      });

      // Chuyển hướng về trang danh sách vé của sự kiện này
      router.push(`/admin/events/${event.id}/tickets`);
      router.refresh(); // Làm mới dữ liệu trang trước
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tạo vé mới.";
      toast.error("Tạo thất bại", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Tạo vé mới</h1>
        <p className="text-muted-foreground">
          Bạn đang tạo vé cho sự kiện:{" "}
          <span className="font-semibold">{event.title}</span>
        </p>
      </div>

      <TicketForm
        onSubmit={handleCreateTicket}
        isLoading={isSubmitting}
        isEditMode={false}
        event={event}
        statusOptions={statusOptions}
        sectionOptions={sectionOptions}
      />
    </div>
  );
}

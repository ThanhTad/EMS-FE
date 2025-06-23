// components/admin/tickets/AdminEditTicketClient.tsx
"use client";

import React, { useState, useCallback } from "react";
import TicketForm from "@/components/admin/tickets/TicketForm";
import {
  adminUpdateTicket,
  getSectionsForEvent,
  getEventById,
} from "@/lib/api";
import { Ticket, UpdateTicketRequest, TicketSelectionModeEnum } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SelectOption = { value: string; label: string };

interface AdminEditTicketClientProps {
  initialTicketData: Ticket;
  eventOptions: SelectOption[];
  statusOptions: SelectOption[];
  initialSectionOptions: SelectOption[];
}

export default function AdminEditTicketClient({
  initialTicketData,
  eventOptions,
  statusOptions,
  initialSectionOptions,
}: AdminEditTicketClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State để quản lý sections và trạng thái loading của nó
  // Khởi tạo với dữ liệu được truyền từ server
  const [sectionOptions, setSectionOptions] = useState<SelectOption[]>(
    initialSectionOptions
  );
  const [isFetchingSections, setIsFetchingSections] = useState(false);
  const [selectedEventTicketMode, setSelectedEventTicketMode] =
    useState<TicketSelectionModeEnum | null>(
      initialTicketData.ticketSelectionMode ?? null
    );

  // Logic này giống hệt trang Create
  const handleEventChange = useCallback(async (eventId: string) => {
    if (!eventId) {
      setSectionOptions([]);
      setSelectedEventTicketMode(null);
      return;
    }
    setIsFetchingSections(true);
    try {
      const eventDetails = await getEventById(eventId);
      setSelectedEventTicketMode(eventDetails.ticketSelectionMode);
      if (eventDetails.ticketSelectionMode === TicketSelectionModeEnum.SEATED) {
        const sections = await getSectionsForEvent(eventId);
        setSectionOptions(
          sections.map((section) => ({
            value: section.id,
            label: section.name,
          }))
        );
      } else {
        setSectionOptions([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Lỗi", { description: error.message });
      }
      toast.error("Không thể tải danh sách khu vực cho sự kiện này.");
      setSectionOptions([]);
    } finally {
      setIsFetchingSections(false);
    }
  }, []);

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
      await adminUpdateTicket(initialTicketData.id, payload);
      toast.success("Cập nhật thành công!", {
        description: "Thông tin vé đã được cập nhật.",
      });
      router.push("/admin/tickets");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật vé.";
      toast.error("Cập nhật thất bại", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chuyển đổi initialData để khớp với kiểu dữ liệu của form
  const formInitialData = {
    ...initialTicketData,
    statusId: initialTicketData.statusId ?? 0,
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
        eventOptions={eventOptions}
        statusOptions={statusOptions}
        sectionOptions={sectionOptions}
        onEventChange={handleEventChange}
        isFetchingSections={isFetchingSections}
        selectedEventTicketMode={selectedEventTicketMode}
      />
    </div>
  );
}

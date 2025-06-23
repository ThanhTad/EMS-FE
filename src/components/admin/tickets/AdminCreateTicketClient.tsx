// components/admin/tickets/AdminCreateTicketClient.tsx (phiên bản cuối cùng)
"use client";

import React, { useState, useCallback } from "react";
import TicketForm from "@/components/admin/tickets/TicketForm";
import {
  adminCreateTicket,
  getSectionsForEvent,
  getEventById,
} from "@/lib/api"; // Thêm 2 API mới
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateTicketRequest, TicketSelectionModeEnum } from "@/types";

type SelectOption = { value: string; label: string };

interface AdminCreateTicketClientProps {
  eventOptions: SelectOption[];
  statusOptions: SelectOption[];
}

export default function AdminCreateTicketClient({
  eventOptions,
  statusOptions,
}: AdminCreateTicketClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State mới để quản lý sections và trạng thái loading của nó
  const [sectionOptions, setSectionOptions] = useState<SelectOption[]>([]);
  const [isFetchingSections, setIsFetchingSections] = useState(false);
  const [selectedEventTicketMode, setSelectedEventTicketMode] =
    useState<TicketSelectionModeEnum | null>(null);

  const handleEventChange = useCallback(async (eventId: string) => {
    if (!eventId) {
      setSectionOptions([]);
      setSelectedEventTicketMode(null);
      return;
    }

    setIsFetchingSections(true);
    try {
      // Lấy chi tiết sự kiện để biết ticketSelectionMode
      const eventDetails = await getEventById(eventId);
      setSelectedEventTicketMode(eventDetails.ticketSelectionMode);

      // Nếu là sự kiện có chỗ ngồi, fetch danh sách khu vực
      if (eventDetails.ticketSelectionMode === TicketSelectionModeEnum.SEATED) {
        const sections = await getSectionsForEvent(eventId);
        setSectionOptions(
          sections.map((section) => ({
            value: section.id,
            label: section.name,
          }))
        );
      } else {
        setSectionOptions([]); // Xóa các options cũ nếu là GA event
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

  const handleCreateTicket = async (data: CreateTicketRequest) => {
    // Logic submit không thay đổi nhiều
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        statusId: Number(data.statusId),
        // Đảm bảo appliesToSectionId là null/undefined nếu không được cung cấp
        appliesToSectionId: data.appliesToSectionId || undefined,
        totalQuantity: data.totalQuantity
          ? Number(data.totalQuantity)
          : undefined,
        maxPerPurchase: data.maxPerPurchase
          ? Number(data.maxPerPurchase)
          : undefined,
      };

      const newTicket = await adminCreateTicket(payload);
      toast.success("Tạo vé thành công!", {
        description: `Vé "${newTicket.name}" đã được tạo.`,
      });
      router.push("/admin/tickets");
      router.refresh();
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
          Điền thông tin chi tiết để tạo một loại vé mới cho sự kiện.
        </p>
      </div>

      <TicketForm
        onSubmit={handleCreateTicket}
        isLoading={isSubmitting}
        isEditMode={false}
        eventOptions={eventOptions}
        statusOptions={statusOptions}
        // Truyền các props mới xuống
        sectionOptions={sectionOptions}
        onEventChange={handleEventChange}
        isFetchingSections={isFetchingSections}
        selectedEventTicketMode={selectedEventTicketMode}
      />
    </div>
  );
}

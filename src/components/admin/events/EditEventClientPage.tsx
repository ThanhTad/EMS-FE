// app/(admin)/events/(id)/edit/EditEventClientPage.tsx
"use client";

import React, { useState } from "react";
import EventForm from "@/components/admin/events/EventForm";
import { adminUpdateEvent } from "@/lib/api";
import {
  Event,
  Category,
  User,
  Venue,
  AuthUser,
  UpdateEventRequest,
} from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditEventClientPageProps {
  initialEvent: Event;
  initialCategories: Category[];
  initialVenues: Venue[];
  initialOrganizers: User[];
  currentUser: AuthUser;
}

export default function EditEventClientPage({
  initialEvent,
  initialCategories,
  initialVenues,
  initialOrganizers,
  currentUser,
}: EditEventClientPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Không cần state cho loading data hay error data nữa!

  const handleUpdateEvent = async (data: UpdateEventRequest) => {
    setIsSubmitting(true);
    try {
      await adminUpdateEvent(initialEvent.id, data);
      toast.success("Cập nhật thành công!", {
        description: `Sự kiện "${data.title}" đã được lưu lại.`,
      });
      router.push("/admin/events");
      router.refresh(); // Làm mới cache của server để danh sách sự kiện được cập nhật
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đã có lỗi không xác định.";
      toast.error("Cập nhật thất bại", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <EventForm
        initialData={initialEvent}
        onSubmit={handleUpdateEvent}
        isLoading={isSubmitting}
        isEditMode={true}
        categoryOptions={initialCategories}
        venueOptions={initialVenues}
        organizerOptions={initialOrganizers}
        currentUser={currentUser}
      />
    </div>
  );
}

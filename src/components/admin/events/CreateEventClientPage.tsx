// app/(admin)/events/new/CreateEventClientPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import EventForm from "@/components/admin/events/EventForm";
import { adminCreateEvent } from "@/lib/api";
import { AuthUser, Category, CreateEventRequest, User, Venue } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Interface cho props nhận từ Server Component
interface CreateEventClientPageProps {
  initialCategories: Category[];
  initialVenues: Venue[];
  initialOrganizers: User[];
  currentUser: AuthUser; // Nhận trực tiếp user từ server, không cần useAuth
}

export default function CreateEventClientPage({
  initialCategories,
  initialVenues,
  initialOrganizers,
  currentUser,
}: CreateEventClientPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Không cần state cho options nữa vì đã được truyền qua props
  // Không cần useEffect để fetch dữ liệu nữa!

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null; // hoặc <LoadingSpinner />
  }

  const handleCreateEvent = async (data: CreateEventRequest) => {
    // Đảm bảo creatorId được gán đúng
    const finalData: CreateEventRequest = {
      ...data,
      // Nếu là admin và đã chọn một organizer khác, dùng id đó.
      // Nếu không, dùng id của người dùng hiện tại.
      creatorId: data.creatorId || currentUser.id,
    };

    setIsLoading(true);
    try {
      await adminCreateEvent(finalData);
      toast.success("Thành công", {
        description: `Sự kiện ${finalData.title} đã được tạo.`,
      });
      router.push("/admin/events");
    } catch (error) {
      let message = "Không thể tạo sự kiện.";
      if (error instanceof Error) {
        message = `Đã xảy ra lỗi: ${error.message}`;
      }
      toast.error("Tạo thất bại", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    // Trường hợp dự phòng, mặc dù server component đã check
    return <p>Đang tải thông tin người dùng...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tạo sự kiện mới</h1>
      <EventForm
        onSubmit={handleCreateEvent}
        isLoading={isLoading} // Chỉ phụ thuộc vào state submit, không còn loading options
        isEditMode={false}
        categoryOptions={initialCategories}
        venueOptions={initialVenues} // Truyền venues xuống form
        organizerOptions={initialOrganizers} // Đổi tên từ moderatorOptions cho nhất quán
        currentUser={currentUser} // Truyền toàn bộ object user xuống
      />
    </div>
  );
}

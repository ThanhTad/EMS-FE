// app/(admin)/events/new/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import EventForm from "@/components/admin/events/EventForm";
import { useAuth } from "@/contexts/AuthContext";
import { adminCreateEvent, getCategories, adminGetOrganizers } from "@/lib/api";
import { Category, CreateEventRequest, User, UserRole } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminCreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [moderatorOptions, setModeratorOptions] = useState<User[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Lấy danh sách category và moderator (nếu là admin)
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [categories, moderators] = await Promise.all([
          getCategories(),
          user?.role === UserRole.ADMIN
            ? adminGetOrganizers()
            : Promise.resolve([]),
        ]);
        setCategoryOptions(categories.content);
        setModeratorOptions(moderators);
      } catch {
        toast.error("Không thể tải danh mục hoặc moderator.");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [user?.role]);

  const handleCreateEvent = async (data: CreateEventRequest) => {
    setIsLoading(true);
    try {
      await adminCreateEvent(data);
      toast.success("Thành công", {
        description: `Sự kiện ${data.title} đã được tạo.`,
      });
      router.push("/admin/events");
    } catch (error) {
      let message = "Không thể tạo sự kiện.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error("Tạo thất bại", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <EventForm
        onSubmit={handleCreateEvent}
        isLoading={isLoading || loadingOptions}
        isEditMode={false}
        categoryOptions={categoryOptions}
        currentUserId={user?.id || ""}
        currentUsername={user?.username || ""}
        currentUserRole={user?.role || UserRole.ORGANIZER}
        moderatorOptions={moderatorOptions}
      />
    </div>
  );
}

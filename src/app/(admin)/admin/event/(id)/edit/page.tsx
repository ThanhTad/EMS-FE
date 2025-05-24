// app/(admin)/events/(id)/edit/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import EventForm from "@/components/admin/events/EventForm";
import {
  getEventById,
  adminUpdateEvent,
  getCategories,
  adminGetOrganizers,
} from "@/lib/api";
import { Event, Category, User, UserRole } from "@/types";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

// Định nghĩa payload update event
export interface AdminUpdateEventPayload {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  categoryIds: string[];
  creatorId: string;
  // các trường khác nếu muốn
}

// Skeleton cho form khi đang load initialData
function EventFormSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-36" />
      </CardFooter>
    </Card>
  );
}

export default function AdminEditEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [initialEventData, setInitialEventData] = useState<Event | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [moderatorOptions, setModeratorOptions] = useState<User[]>([]);

  // Fetch event data
  const fetchEventData = useCallback(async () => {
    if (!eventId) {
      toast.error("Thiếu thông tin", {
        description: "Không tìm thấy ID sự kiện.",
      });
      setFetchError("Không tìm thấy ID sự kiện.");
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const [eventRes, categoriesRes, moderatorsRes] = await Promise.all([
        getEventById(eventId),
        getCategories(),
        user?.role === UserRole.ADMIN
          ? adminGetOrganizers()
          : Promise.resolve([]),
      ]);
      setInitialEventData(eventRes);
      setCategoryOptions(categoriesRes.content);
      setModeratorOptions(moderatorsRes);
    } catch (error) {
      let message = "Không thể tải dữ liệu sự kiện.";
      if (error instanceof Error) {
        message = error.message;
      }
      setFetchError(message);
      toast.error("Lỗi", {
        description: `Không thể tải dữ liệu cho sự kiện ${eventId}: ${message}`,
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [eventId, user?.role]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleUpdateEvent = async (data: AdminUpdateEventPayload) => {
    if (!eventId) {
      toast.error("Lỗi xác thực", { description: "Vui lòng đăng nhập lại." });
      return;
    }
    setIsSubmitting(true);
    try {
      await adminUpdateEvent(eventId, data);
      toast.success("Thành công", {
        description: "Thông tin sự kiện đã được cập nhật.",
      });
      router.push("/admin/events");
      router.refresh();
    } catch (error) {
      let message = "Không thể cập nhật sự kiện.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error("Cập nhật thất bại", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <EventFormSkeleton />
      </div>
    );
  }

  if (fetchError || !initialEventData) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>
            {fetchError || "Không tìm thấy sự kiện này."}
          </AlertDescription>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/admin/events">Quay lại danh sách</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EventForm
        initialData={initialEventData}
        onSubmit={handleUpdateEvent}
        isLoading={isSubmitting}
        isEditMode={true}
        categoryOptions={categoryOptions}
        currentUserId={user?.id || ""}
        currentUsername={user?.username || ""}
        currentUserRole={user?.role || UserRole.ORGANIZER}
        moderatorOptions={moderatorOptions}
      />
    </div>
  );
}

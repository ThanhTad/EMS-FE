// app/(admin)/tickets/(id)/edit/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import TicketForm from "@/components/admin/tickets/TicketForm";
import {
  adminGetTicketById,
  adminUpdateTicket,
  getEvents,
  getAllStatuses,
} from "@/lib/api";
import { Ticket, Event, UpdateTicketRequest, StatusCode } from "@/types";
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

// Skeleton cho form khi đang load initialData
function TicketFormSkeleton() {
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

export default function AdminEditTicketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const [initialTicketData, setInitialTicketData] = useState<Ticket | null>(
    null
  );
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [eventOptions, setEventOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [statusOptions, setStatusOptions] = useState<
    { id: number; name: string }[]
  >([]);

  // Fetch ticket data
  const fetchTicketData = useCallback(async () => {
    if (!ticketId) {
      toast.error("Thiếu thông tin", {
        description: "Không tìm thấy ID vé.",
      });
      setFetchError("Không tìm thấy ID vé.");
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const [ticketRes, eventsRes, allStatuses] = await Promise.all([
        adminGetTicketById(ticketId),
        getEvents({ page: 0, size: 1000 }),
        getAllStatuses(),
      ]);
      setInitialTicketData(ticketRes);
      setEventOptions(
        (eventsRes?.content ?? []).map((e: Event) => ({
          id: e.id,
          name: e.title,
        }))
      );
      setStatusOptions(
        allStatuses
          .filter((s: StatusCode) => s.entityType === "TICKET")
          .map((s: StatusCode) => ({ id: s.id, name: s.status }))
      );
    } catch (error) {
      let message = "Không thể tải dữ liệu vé.";
      if (error instanceof Error) {
        message = error.message;
      }
      setFetchError(message);
      toast.error("Lỗi", {
        description: `Không thể tải dữ liệu cho vé ${ticketId}: ${message}`,
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);

  const handleUpdateTicket = async (data: UpdateTicketRequest) => {
    if (!ticketId) {
      toast.error("Lỗi xác thực", { description: "Vui lòng đăng nhập lại." });
      return;
    }
    setIsSubmitting(true);
    try {
      await adminUpdateTicket(ticketId, data);
      toast.success("Thành công", {
        description: "Thông tin vé đã được cập nhật.",
      });
      router.push("/admin/tickets");
      router.refresh();
    } catch (error) {
      let message = "Không thể cập nhật vé.";
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
        <TicketFormSkeleton />
      </div>
    );
  }

  if (fetchError || !initialTicketData) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>
            {fetchError || "Không tìm thấy vé này."}
          </AlertDescription>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/admin/tickets">Quay lại danh sách</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TicketForm
        initialData={initialTicketData}
        onSubmit={handleUpdateTicket}
        isLoading={isSubmitting}
        isEditMode={true}
        eventOptions={eventOptions}
        statusOptions={statusOptions}
      />
    </div>
  );
}

// app/admin/venues/new/NewVenueClient.tsx
"use client";

import React, { useState } from "react";
import {
  VenueForm,
  VenueFormValues,
} from "@/components/admin/venues/VenueForm"; // Import cả type
import { createVenue } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ApiErrorResponse } from "@/types"; // Import type lỗi

export default function NewVenueClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateVenue = async (data: VenueFormValues) => {
    setIsLoading(true);
    try {
      await createVenue(data); // API createVenue đã được định nghĩa để nhận đúng kiểu dữ liệu
      toast.success("Tạo địa điểm thành công!");
      router.push("/admin/venues");
      router.refresh(); // Làm mới cache để danh sách địa điểm được cập nhật
    } catch (error) {
      console.error("Create venue error:", error);
      // Xử lý lỗi từ API tốt hơn
      const apiError = error as ApiErrorResponse;
      const message =
        apiError?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      // Nếu có lỗi validation từ backend
      const validationErrors =
        apiError?.errors?.map((e) => `${e.field}: ${e.message}`).join("\n") ||
        "";

      toast.error(message, { description: validationErrors });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VenueForm
      isEditMode={false}
      onSubmit={handleCreateVenue}
      isLoading={isLoading} // Truyền trạng thái loading xuống
    />
  );
}

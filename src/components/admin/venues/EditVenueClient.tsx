// app/admin/venues/[venueId]/edit/EditVenueClient.tsx

"use client"; // BẮT BUỘC phải có

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  VenueForm,
  VenueFormValues,
} from "@/components/admin/venues/VenueForm";
import { adminUpdateVenue } from "@/lib/api";
import { Venue, UpdateVenueRequest, ApiErrorResponse } from "@/types";

// Nhận props từ Server Component
interface EditVenueClientProps {
  initialVenue: Venue;
}

export default function EditVenueClient({
  initialVenue,
}: EditVenueClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý việc update, được truyền vào VenueForm
  const handleUpdateVenue = async (data: VenueFormValues) => {
    setIsLoading(true);
    try {
      // payload có thể là toàn bộ data từ form
      const payload: UpdateVenueRequest = data;

      await adminUpdateVenue(initialVenue.id, payload);
      toast.success("Cập nhật địa điểm thành công!");

      router.push("/admin/venues");
      router.refresh(); // Quan trọng: làm mới data ở các trang khác
    } catch (error) {
      console.error("Update venue error:", error);
      const apiError = error as ApiErrorResponse;
      const message =
        apiError?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      toast.error("Cập nhật thất bại", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Logic render form không có gì thay đổi
  // Lưu ý: Dựa trên refactor ở câu trả lời trước,
  // VenueForm sẽ nhận isLoading và onSubmit từ component cha.
  return (
    <VenueForm
      isEditMode={true}
      initialData={initialVenue}
      onSubmit={handleUpdateVenue}
      isLoading={isLoading}
    />
  );
}

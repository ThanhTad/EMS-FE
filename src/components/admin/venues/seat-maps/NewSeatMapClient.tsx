// app/admin/venues/[venueId]/seat-maps/new/NewSeatMapClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSeatMap } from "@/lib/api";
import {
  SeatMapPayload,
  CreateSeatMapRequest,
  ApiErrorResponse,
} from "@/types";
import SeatMapDesigner from "@/components/admin/venues/seat-maps/SeatMapDesigner";

// Nhận venueId từ Server Component
interface NewSeatMapClientProps {
  venueId: string;
}

export default function NewSeatMapClient({ venueId }: NewSeatMapClientProps) {
  const router = useRouter();

  const handleSave = async (payload: SeatMapPayload) => {
    try {
      const apiPayload: CreateSeatMapRequest = {
        venueId: venueId, // Lấy từ props
        name: payload.name,
        description: payload.description,
        sections: payload.sections.map((section) => ({
          name: section.name,
          capacity: section.seats.length,
          layoutData: {},
        })),
      };

      await createSeatMap(apiPayload);
      toast.success("Tạo sơ đồ thành công!");

      router.push(`/admin/venues/${venueId}/seat-maps`);
      router.refresh();
    } catch (error) {
      console.error("Failed to create seat map:", error);
      const apiError = error as ApiErrorResponse;
      const message = apiError?.message || "Đã xảy ra lỗi không xác định.";
      toast.error("Tạo sơ đồ thất bại", { description: message });
    }
  };

  return (
    <div className="w-full h-screen">
      <SeatMapDesigner isEditMode={false} onSave={handleSave} />
    </div>
  );
}

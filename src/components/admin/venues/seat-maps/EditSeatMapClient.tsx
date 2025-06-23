// app/admin/venues/[venueId]/seat-maps/[seatMapId]/edit/EditSeatMapClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSeatMap } from "@/lib/api";
import SeatMapDesigner from "@/components/admin/venues/seat-maps/SeatMapDesigner";
import {
  SeatMapDetails,
  SeatMapPayload,
  UpdateSeatMapRequest,
  ApiErrorResponse,
} from "@/types";

// Nhận dữ liệu ban đầu từ Server Component
interface EditSeatMapClientProps {
  initialData: SeatMapDetails;
}

export default function EditSeatMapClient({
  initialData,
}: EditSeatMapClientProps) {
  const router = useRouter();

  // onSave là prop được truyền cho SeatMapDesigner
  const handleSave = async (payload: SeatMapPayload) => {
    try {
      // 1. Chuyển đổi dữ liệu từ output của Designer sang payload của API
      // Logic adapter này rất quan trọng
      const updateRequest: UpdateSeatMapRequest = {
        name: payload.name,
        description: payload.description,
        sections: payload.sections.map((section) => ({
          id: section.id,
          name: section.name,
          capacity: section.seats.length,
          layout: {
            startX: section.layout.startX,
            startY: section.layout.startY,
            width: section.layout.width,
            height: section.layout.height,
            color: section.layout.color,
          },
          seats: section.seats.map((seat) => ({
            id: seat.id,
            rowLabel: seat.rowLabel,
            seatNumber: seat.seatNumber,
            coordinates: {
              x: seat.coordinates.x,
              y: seat.coordinates.y,
            },
            seatType: seat.seatType,
          })),
        })),
      };

      // 2. Gọi API để cập nhật
      await updateSeatMap(initialData.id, updateRequest);

      toast.success("Lưu sơ đồ thành công!");
      // 3. Điều hướng người dùng sau khi lưu
      // Có thể quay lại trang danh sách sơ đồ
      router.push(`/admin/venues/${initialData.venueId}/seat-maps`);
      router.refresh();
    } catch (error) {
      console.error("Failed to save seat map:", error);
      const apiError = error as ApiErrorResponse;
      const message = apiError?.message || "Đã xảy ra lỗi không xác định.";
      toast.error("Lưu sơ đồ thất bại", { description: message });
    }
  };

  // Logic render đã được đơn giản hóa, không còn check isLoading hay !initialData nữa
  // vì những việc đó đã được Server Component đảm bảo
  return (
    <div className="w-full h-screen">
      <SeatMapDesigner
        isEditMode={true}
        onSave={handleSave}
        initialData={initialData}
      />
    </div>
  );
}

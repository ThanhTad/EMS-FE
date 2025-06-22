// app/admin/venues/[venueId]/seat-maps/new/page.tsx
"use client";

import SeatMapDesigner from "@/components/admin/venues/seat-maps/SeatMapDesigner";
import { createSeatMap } from "@/lib/api";
import { SeatMapPayload } from "@/types"; // <--- IMPORT KIỂU DỮ LIỆU

interface NewSeatMapPageProps {
  params: {
    venueId: string;
  };
}

const NewSeatMapPage = ({ params }: NewSeatMapPageProps) => {
  // Sửa lại kiểu của tham số ở đây
  const handleSave = async (payload: SeatMapPayload) => {
    // API createSeatMap cần được cập nhật để nhận vào một object
    // chứa cả venueId và dữ liệu từ payload
    const fullPayload = {
      ...payload,
      venueId: params.venueId, // Gắn venueId vào payload
    };
    // Giả sử API createSeatMap chấp nhận payload như vậy
    await createSeatMap(fullPayload);
  };

  return (
    <div className="w-full h-screen">
      <SeatMapDesigner isEditMode={false} onSave={handleSave} />
    </div>
  );
};

export default NewSeatMapPage;

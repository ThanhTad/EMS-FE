// app/admin/venues/[venueId]/seat-maps/[seatMapId]/edit/page.tsx
"use client";

import SeatMapDesigner from "@/components/admin/venues/seat-maps/SeatMapDesigner";
import { getSeatMapDetails, updateSeatMap } from "@/lib/api";
import { SeatMapDetails, SeatMapPayload, UpdateSeatMapRequest } from "@/types"; // <--- IMPORT KIỂU DỮ LIỆU
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditSeatMapPageProps {
  params: {
    venueId: string; // venueId có thể không cần thiết ở đây, nhưng giữ lại cũng không sao
    seatMapId: string;
  };
}

const EditSeatMapPage = ({ params }: EditSeatMapPageProps) => {
  const { seatMapId } = params;
  const [initialData, setInitialData] = useState<SeatMapDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const data = await getSeatMapDetails(seatMapId);
        setInitialData(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Lỗi: ${error.message}`);
        }
        toast.error("Không thể tải chi tiết sơ đồ.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [seatMapId]);

  // Sửa lại kiểu của tham số ở đây
  const handleSave = async (payload: UpdateSeatMapRequest) => {
    // Hàm API updateSeatMap(id, payload) đã phù hợp
    await updateSeatMap(seatMapId, payload);
  };

  // Adapter chuyển kiểu dữ liệu
  const handleSaveAdapter = async (payload: SeatMapPayload) => {
    const updateRequest: UpdateSeatMapRequest = {
      ...payload,
      sections: payload.sections.map((section) => ({
        ...section,
        capacity: section.seats.length, // hoặc logic capacity phù hợp
      })),
    };
    await handleSave(updateRequest);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="text-center mt-10">Không tìm thấy dữ liệu sơ đồ.</div>
    );
  }

  return (
    <div className="w-full h-screen">
      <SeatMapDesigner
        isEditMode={true}
        onSave={handleSaveAdapter}
        initialData={initialData}
      />
    </div>
  );
};

export default EditSeatMapPage;

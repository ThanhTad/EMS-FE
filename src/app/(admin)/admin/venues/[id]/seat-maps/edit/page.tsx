// app/admin/venues/[venueId]/seat-maps/[seatMapId]/edit/page.tsx
import { getSeatMapDetails } from "@/lib/api";
import { notFound } from "next/navigation";
import EditSeatMapClient from "@/components/admin/venues/seat-maps/EditSeatMapClient"; // <-- Component client mới
import { Metadata } from "next";

interface EditSeatMapPageProps {
  params: {
    seatMapId: string;
  };
}

// Metadata động
export async function generateMetadata({
  params,
}: EditSeatMapPageProps): Promise<Metadata> {
  try {
    const seatMap = await getSeatMapDetails(params.seatMapId);
    return {
      title: `Thiết kế Sơ đồ: ${seatMap.name} | Admin EMS`,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return {
        title: "Không tìm thấy sơ đồ | Admin EMS",
        description: "Không thể tải sơ đồ để chỉnh sửa.",
      };
    }
    return {
      title: "Thiết kế Sơ đồ | Admin EMS",
    };
  }
}

// Biến page thành một hàm async
export default async function EditSeatMapPage({
  params,
}: EditSeatMapPageProps) {
  const { seatMapId } = params;

  try {
    // 1. Fetch dữ liệu chi tiết sơ đồ trên server
    const seatMapDetails = await getSeatMapDetails(seatMapId);

    // 2. Render Client Component và truyền dữ liệu xuống
    // Toàn bộ logic loading, state, useEffect đã được loại bỏ!
    return <EditSeatMapClient initialData={seatMapDetails} />;
  } catch (error) {
    // 3. Xử lý trường hợp không tìm thấy sơ đồ
    console.error(`Seat map with id ${seatMapId} not found.`, error);
    notFound();
  }
}

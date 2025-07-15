// app/admin/venues/[venueId]/seat-maps/new/page.tsx
import NewSeatMapClient from "@/components/admin/venues/seat-maps/NewSeatMapClient";
import { getVenueById } from "@/lib/api";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface NewSeatMapPageProps {
  params: {
    venueId: string;
  };
}

export async function generateMetadata({
  params,
}: NewSeatMapPageProps): Promise<Metadata> {
  try {
    const venue = await getVenueById(params.venueId);
    return {
      title: `Tạo Sơ đồ mới cho ${venue.name} | Admin EMS`,
    };
  } catch {
    return {
      title: "Tạo Sơ đồ mới | Admin EMS",
    };
  }
}

export default async function NewSeatMapPage({ params }: NewSeatMapPageProps) {
  const { venueId } = params;

  // LỢI ÍCH 1: Xác thực venueId tồn tại ở phía server
  try {
    // Chỉ cần gọi để kiểm tra, không cần dùng data
    await getVenueById(venueId);
  } catch (error) {
    console.error(
      `Venue with id ${venueId} not found. Cannot create seat map.`,
      error
    );
    notFound();
  }

  // LỢI ÍCH 2: Cấu trúc nhất quán với trang edit
  // Truyền venueId xuống cho client component
  return <NewSeatMapClient venueId={venueId} />;
}

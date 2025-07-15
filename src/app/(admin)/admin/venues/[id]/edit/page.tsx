// app/admin/venues/[venueId]/edit/page.tsx
import { getVenueById } from "@/lib/api";
import { notFound } from "next/navigation";
import EditVenueClient from "@/components/admin/venues/EditVenueClient";

interface EditVenuePageProps {
  params: {
    venueId: string;
  };
}

// Biến page thành một hàm async
export default async function EditVenuePage({ params }: EditVenuePageProps) {
  const { venueId } = params;

  try {
    // 1. Fetch dữ liệu trực tiếp trên server
    const venue = await getVenueById(venueId);

    // 2. Nếu thành công, render Client Component và truyền dữ liệu xuống làm props
    // Không cần useState, useEffect, hay isLoading nữa!
    return <EditVenueClient initialVenue={venue} />;
  } catch (error) {
    // 3. Nếu API getVenueById ném lỗi (ví dụ 404),
    // hàm notFound() của Next.js sẽ tự động render file not-found.tsx gần nhất.
    console.error("Failed to fetch venue for editing:", error);
    notFound();
  }
}

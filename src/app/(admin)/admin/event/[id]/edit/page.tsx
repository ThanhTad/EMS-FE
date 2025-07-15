// app/(admin)/events/(id)/edit/page.tsx

import {
  getEventById,
  getCategories,
  getVenues,
  adminGetOrganizers,
} from "@/lib/api";
import { getAndVerifyServerSideUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { User, UserRole } from "@/types";
import EditEventClientPage from "@/components/admin/events/EditEventClientPage"; // Component Client sẽ tạo ở bước 2
import { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";

// Tạo Metadata động dựa trên tiêu đề sự kiện
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const event = await getEventById(params.id);
    return {
      title: `Sửa sự kiện: ${event.title} | Admin EMS`,
    };
  } catch {
    return {
      title: "Sửa sự kiện | Admin EMS",
    };
  }
}

interface AdminEditEventPageProps {
  params: { id: string };
}

export default async function AdminEditEventPage({
  params,
}: AdminEditEventPageProps) {
  const eventId = params.id;

  // 1. Xác thực và Phân quyền trên Server
  const currentUser = await getAndVerifyServerSideUser();
  if (!currentUser) {
    redirect(`/login?callbackUrl=/admin/events/${eventId}/edit`);
  }

  // 2. Fetch tất cả dữ liệu cần thiết song song
  try {
    const [eventData, categoriesData, venuesData, organizersData] =
      await Promise.all([
        getEventById(eventId),
        getCategories({ size: 1000 }),
        getVenues({ size: 1000 }),
        currentUser.role === UserRole.ADMIN
          ? adminGetOrganizers()
          : Promise.resolve([] as User[]),
      ]);

    // 3. KIỂM TRA QUYỀN SỞ HỮU (RẤT QUAN TRỌNG)
    // Nếu người dùng là ORGANIZER, họ chỉ được sửa sự kiện của chính mình.
    if (
      currentUser.role === UserRole.ORGANIZER &&
      eventData.creatorId !== currentUser.id
    ) {
      redirect("/unauthorized"); // Hoặc trang báo lỗi không có quyền
    }

    // 4. Truyền dữ liệu xuống Client Component
    return (
      <EditEventClientPage
        initialEvent={eventData}
        initialCategories={categoriesData.content}
        initialVenues={venuesData.content}
        initialOrganizers={organizersData}
        currentUser={currentUser}
      />
    );
  } catch (error) {
    // 5. Xử lý lỗi nếu không fetch được dữ liệu
    console.error(`Failed to fetch data for event ${eventId}:`, error);
    return (
      <div className="container mx-auto mt-10">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi không thể tải dữ liệu</AlertTitle>
          <AlertDescription>
            Không thể tìm thấy sự kiện hoặc đã có lỗi xảy ra. Vui lòng kiểm tra
            lại ID sự kiện và thử lại.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}

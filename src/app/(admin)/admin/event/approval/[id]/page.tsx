import { getEventById } from "@/lib/api"; // API để lấy chi tiết 1 sự kiện
import { getAndVerifyServerSideUser } from "@/lib/session";
import { UserRole } from "@/types";
import { redirect } from "next/navigation";
import EventDetailView from "@/components/admin/events/approval/EventDetailView"; // Component chỉ để hiển thị
import ApprovalActionButtons from "@/components/admin/events/approval/ApprovalActionButtons"; // Component chứa nút

interface Props {
  params: { id: string };
}

export default async function EventApprovalDetailPage({ params }: Props) {
  // 1. Xác thực
  const currentUser = await getAndVerifyServerSideUser();
  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    redirect("/unauthorized");
  }

  // 2. Fetch chi tiết sự kiện trên server
  const event = await getEventById(params.id);

  if (!event) {
    return <div>Không tìm thấy sự kiện.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Chi tiết Sự kiện Chờ Duyệt</h1>

      {/* 3. Khu vực hành động, là một client component */}
      <ApprovalActionButtons eventId={event.id} />

      {/* 4. Component hiển thị thông tin, có thể là Server hoặc Client Component */}
      <EventDetailView event={event} />
    </div>
  );
}

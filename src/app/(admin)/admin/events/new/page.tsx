// app/(admin)/events/new/page.tsx
import { getCategories, adminGetVenues, adminGetOrganizers } from "@/lib/api";
import { getAndVerifyServerSideUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Category, User, UserRole, Venue } from "@/types";
import CreateEventClientPage from "@/components/admin/events/CreateEventClientPage"; // <-- Component client sẽ được tạo ở bước 2
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo Sự kiện mới | Admin EMS",
};

export default async function AdminCreateEventPage() {
  // 1. Xác thực và lấy thông tin người dùng từ server
  const currentUser = await getAndVerifyServerSideUser();

  if (!currentUser) {
    redirect("/login?callbackUrl=/admin/events/new");
  }

  // Chỉ ADMIN hoặc ORGANIZER mới được tạo sự kiện
  const canCreate =
    currentUser.role === UserRole.ADMIN ||
    currentUser.role === UserRole.ORGANIZER;

  if (!canCreate) {
    redirect("/unauthorized");
  }

  // 2. Fetch toàn bộ dữ liệu cần thiết cho form ngay trên server
  // Promise.all giúp các request chạy song song, tăng tốc độ tải
  try {
    const [categoriesData, venuesData, organizersData] = await Promise.all([
      getCategories({ size: 1000 }), // Lấy tất cả categories
      adminGetVenues({ size: 1000 }), // Lấy tất cả venues
      // Chỉ fetch organizers nếu là ADMIN
      currentUser.role === UserRole.ADMIN
        ? adminGetOrganizers()
        : Promise.resolve([] as User[]), // Trả về mảng rỗng nếu là ORGANIZER
    ]);

    const categories: Category[] = categoriesData.content;
    const venues: Venue[] = venuesData.content;
    const organizers: User[] = organizersData;

    // 3. Truyền dữ liệu đã fetch xuống Client Component qua props
    return (
      <CreateEventClientPage
        initialCategories={categories}
        initialVenues={venues}
        initialOrganizers={organizers}
        currentUser={currentUser}
      />
    );
  } catch (error) {
    // Xử lý lỗi nếu không fetch được dữ liệu cần thiết
    console.error("Failed to fetch initial data for event form:", error);
    // Có thể hiển thị một trang lỗi ở đây
    return (
      <div>
        <h1>Lỗi tải dữ liệu</h1>
        <p>
          Không thể tải các tài nguyên cần thiết để tạo sự kiện. Vui lòng thử
          lại.
        </p>
      </div>
    );
  }
}

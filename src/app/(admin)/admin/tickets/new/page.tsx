// app/(admin)/tickets/new/page.tsx
import React from "react";
import { getEvents, getAllStatuses } from "@/lib/api";
import { StatusCode } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import AdminCreateTicketClient from "@/components/admin/tickets/AdminCreateTicketClient";

// Định nghĩa kiểu cho options ngay tại đây hoặc import từ một file chung
type SelectOption = {
  value: string;
  label: string;
};

// Page giờ là một async function component!
export default async function AdminCreateTicketPage() {
  // Dữ liệu được fetch ngay trên server khi render trang
  try {
    const [eventsPage, allStatuses] = await Promise.all([
      getEvents({ page: 0, size: 1000 }),
      getAllStatuses(),
    ]);

    const eventOptions: SelectOption[] = eventsPage.content.map((e) => ({
      value: e.id,
      label: e.title,
    }));

    const statusOptions: SelectOption[] = allStatuses
      .filter((s: StatusCode) => s.entityType === "TICKET")
      .map((s: StatusCode) => ({
        value: String(s.id),
        label: s.status,
      }));

    // Render Client Component và truyền dữ liệu đã fetch làm props
    return (
      <AdminCreateTicketClient
        eventOptions={eventOptions}
        statusOptions={statusOptions}
      />
    );
  } catch (error) {
    // Nếu có lỗi khi fetch dữ liệu trên server, hiển thị thông báo lỗi
    // Trang sẽ không bị crash, mà render ra một UI lỗi thân thiện
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Không thể tải dữ liệu cần thiết cho việc tạo vé.";

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Tạo vé mới</h1>
          <p className="text-muted-foreground">
            Đã xảy ra lỗi khi chuẩn bị form.
          </p>
        </div>
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }
}

// components/admin/tickets/TicketTableColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ticket, User, UserRole } from "@/types";
import HighlightedText from "@/components/ui/highlighted-text";
import TicketActionsCell from "./TicketActionsCell";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Hàm tiện ích để xác định trạng thái hiển thị của vé
function getTicketDisplayStatus(ticket: Ticket): {
  text: string;
  color: string;
} {
  const now = new Date();
  const start = ticket.saleStartDate ? new Date(ticket.saleStartDate) : null;
  const end = ticket.saleEndDate ? new Date(ticket.saleEndDate) : null;

  if (ticket.status?.status.toLowerCase() === "inactive") {
    return { text: "Tạm ẩn", color: "bg-neutral-400" };
  }
  if ((ticket.availableQuantity ?? 0) <= 0 && ticket.totalQuantity! > 0) {
    return { text: "Hết vé", color: "bg-red-600" };
  }

  if (start && now < start) {
    return { text: "Sắp mở bán", color: "bg-yellow-500" };
  }
  if (end && now > end) {
    return { text: "Đã kết thúc", color: "bg-gray-500" };
  }
  return { text: "Đang bán", color: "bg-green-600" };
}

// Định nghĩa các cột cho bảng
export function ticketColumns(
  keyword: string,
  currentUser: User
): ColumnDef<Ticket>[] {
  return [
    {
      accessorKey: "name",
      header: "Tên vé",
      cell: ({ row }) => (
        <div className="font-medium">
          <HighlightedText text={row.original.name} keyword={keyword} />
          {row.original.appliesToSectionId && (
            <p className="text-xs text-muted-foreground">
              {/* Giả định có 1 map sectionId -> sectionName để hiển thị tên khu vực */}
              Khu vực:{" "}
              {row.original.event?.seatMap?.sections?.find(
                (s) => s.id === row.original.appliesToSectionId
              )?.name || "N/A"}
            </p>
          )}
        </div>
      ),
    },
    {
      // Giả sử API trả về event object được lồng vào trong ticket
      accessorKey: "event.title",
      header: "Sự kiện",
      cell: ({ row }) => row.original.event?.title || "Không xác định",
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) =>
        row.original.price === 0 ? (
          <Badge variant="secondary">Miễn phí</Badge>
        ) : (
          `${row.original.price.toLocaleString()}₫`
        ),
    },
    {
      id: "quantity",
      header: "Số lượng (Còn lại/Tổng)",
      cell: ({ row }) => {
        const { availableQuantity, totalQuantity } = row.original;
        const isLowStock =
          typeof availableQuantity === "number" &&
          typeof totalQuantity === "number" &&
          totalQuantity > 0 &&
          availableQuantity / totalQuantity < 0.1;
        return (
          <div className="text-center">
            <span className={isLowStock ? "text-orange-500 font-bold" : ""}>
              {`${availableQuantity ?? "N/A"} / ${totalQuantity ?? "N/A"}`}
            </span>
          </div>
        );
      },
    },
    {
      id: "saleTime",
      header: "Thời gian bán",
      cell: ({ row }) => {
        const start = row.original.saleStartDate
          ? new Date(row.original.saleStartDate)
          : null;
        const end = row.original.saleEndDate
          ? new Date(row.original.saleEndDate)
          : null;
        if (!start || !end)
          return <span className="text-muted-foreground">N/A</span>;
        return (
          <div className="text-sm">
            <p>{format(start, "dd/MM/yy HH:mm")}</p>
            <p className="text-muted-foreground">
              đến {format(end, "dd/MM/yy HH:mm")}
            </p>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = getTicketDisplayStatus(row.original);
        return (
          <Badge className={`${status.color} hover:${status.color}`}>
            {status.text}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ticket = row.original;
        // Kiểm tra quyền: ADMIN hoặc ORGANIZER sở hữu sự kiện
        const eventCreatorId = ticket.event?.creatorId;
        const canManage =
          currentUser.role === UserRole.ADMIN ||
          (currentUser.role === UserRole.ORGANIZER &&
            eventCreatorId === currentUser.id);

        if (!canManage) return null;

        return <TicketActionsCell ticket={ticket} />;
      },
    },
  ];
}

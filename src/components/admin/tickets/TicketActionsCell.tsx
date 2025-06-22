// components/admin/tickets/TicketActionsCell.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Ticket } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminDeleteTicket } from "@/lib/api";

interface TicketActionsCellProps {
  ticket: Ticket;
}

const TicketActionsCell: React.FC<TicketActionsCellProps> = ({ ticket }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Chuyển đến trang sửa vé
  const handleEditTicket = useCallback(() => {
    // Nên điều hướng đến trang quản lý vé trong context của sự kiện
    // Ví dụ: /admin/events/EVENT_ID/tickets/TICKET_ID/edit
    router.push(`/admin/events/${ticket.eventId}/tickets/${ticket.id}/edit`);
  }, [router, ticket.id, ticket.eventId]);

  // Xử lý xóa vé
  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await adminDeleteTicket(ticket.id);
      toast.success(`Vé "${ticket.name}" đã được xóa thành công.`);
      // Tốt nhất là sử dụng một cơ chế state management (như SWR hoặc React Query) để cập nhật UI
      // thay vì refresh toàn bộ trang. Tạm thời dùng router.refresh().
      router.refresh();
    } catch (err) {
      // Cải thiện báo lỗi: Backend có thể trả về lỗi cụ thể, ví dụ "Không thể xóa vé đã có người mua".
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Xoá vé thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }, [ticket.id, ticket.name, router]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" type="button">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={isDeleting}
            onClick={handleEditTicket}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Sửa vé</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isDeleting}
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Xóa vé</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog xác nhận xóa */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Vé <strong>{ticket.name}</strong> sẽ bị xóa vĩnh viễn. Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isDeleting}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              aria-busy={isDeleting}
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TicketActionsCell;

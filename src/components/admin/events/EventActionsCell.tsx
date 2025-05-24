// components/admin/events/EventActionsCell.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Event } from "@/types";
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
import { adminDeleteEvent } from "@/lib/api"; // Sử dụng hàm API từ lib/api.ts

interface EventActionsCellProps {
  event: Event;
}

const EventActionsCell: React.FC<EventActionsCellProps> = ({ event }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sửa sự kiện
  const handleEditEvent = useCallback(() => {
    router.push(`/admin/events/${event.id}/edit`);
  }, [router, event.id]);

  // Xoá sự kiện
  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await adminDeleteEvent(event.id);
      toast.success(`Sự kiện "${event.title}" đã được xóa.`);
      router.refresh();
    } catch (err) {
      let message = "Xoá sự kiện thất bại. Vui lòng thử lại.";
      if (err instanceof Error) message = err.message;
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }, [event.id, event.title, router]);

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
            asChild
            disabled={isDeleting}
            onClick={handleEditEvent}
          >
            <button type="button" className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Sửa sự kiện
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild disabled={isDeleting}>
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa sự kiện
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Sự kiện <strong>{event.title}</strong> sẽ bị xóa vĩnh viễn. Bạn có
              chắc không?
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
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventActionsCell;

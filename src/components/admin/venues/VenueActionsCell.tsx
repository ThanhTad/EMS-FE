// app/admin/venues/actions-cell.tsx
"use client";

import { useState, useCallback } from "react";
import { Venue } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  LayoutGrid,
} from "lucide-react";
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
import { toast } from "sonner";
import { deleteVenue } from "@/lib/api";

interface VenueActionsCellProps {
  venue: Venue;
}

export const VenueActionsCell: React.FC<VenueActionsCellProps> = ({
  venue,
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = useCallback(() => {
    router.push(`/admin/venues/${venue.id}/edit`);
  }, [router, venue.id]);

  // Cập nhật hàm này để điều hướng đến trang quản lý sơ đồ
  const handleManageSeatMaps = useCallback(() => {
    router.push(`/admin/venues/${venue.id}/seat-maps`);
  }, [router, venue.id]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteVenue(venue.id);
      toast.success(`Địa điểm "${venue.name}" đã được xóa.`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Xóa địa điểm thất bại.";
      toast.error(message, {
        description:
          "Địa điểm này có thể đang được sử dụng bởi một sự kiện hoặc sơ đồ.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }, [venue.id, venue.name, router]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Sửa thông tin</span>
          </DropdownMenuItem>
          {/* Đây là điểm kết nối quan trọng */}
          <DropdownMenuItem onClick={handleManageSeatMaps}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Quản lý Sơ đồ</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Xóa địa điểm</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa địa điểm <strong>{venue.name}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tiếp tục xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// components/admin/events/CategoryActionsCell.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Category } from "@/types";
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
import { adminDeleteCategory } from "@/lib/api"; // Giả định đường dẫn này đúng

interface CategoryActionsCellProps {
  category: Category;
}

const CategoryActionsCell: React.FC<CategoryActionsCellProps> = ({
  category,
}) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditCategory = useCallback(() => {
    // Chuyển đến trang chỉnh sửa danh mục
    router.push(`/admin/categories/${category.id}/edit`);
  }, [router, category.id]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await adminDeleteCategory(category.id);
      toast.success(`Danh mục "${category.name}" đã được xóa.`);
      // Làm mới dữ liệu từ server để cập nhật bảng
      router.refresh();
    } catch (err) {
      // Cải thiện thông báo lỗi, có thể backend trả về lỗi cụ thể hơn
      // Ví dụ: Không thể xóa danh mục vì đang có sự kiện sử dụng.
      const errorMessage =
        err instanceof Error ? err.message : "Xóa danh mục thất bại.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }, [category.id, category.name, router]);

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
          {/* Cải tiến: Loại bỏ `asChild` và `<button>` không cần thiết */}
          <DropdownMenuItem
            disabled={isDeleting}
            onClick={handleEditCategory}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Sửa danh mục</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Cải tiến: Tương tự cho nút Xóa */}
          <DropdownMenuItem
            disabled={isDeleting}
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center text-red-600 hover:!text-red-600 focus:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/50 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Xóa danh mục</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog xác nhận xóa không thay đổi, nó đã được viết tốt */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh
              viễn danh mục <strong>{category.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryActionsCell;

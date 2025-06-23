// app/(admin)/categories/CategoriesClient.tsx
"use client";

import React, { useState } from "react";
import { adminDeleteCategory } from "@/lib/api";
import { Category } from "@/types";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({
  initialCategories,
}: CategoriesClientProps) {
  // 1. State được khởi tạo từ props, không cần useEffect để fetch
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (idToDelete: string) => {
    setDeletingId(idToDelete);
    try {
      await adminDeleteCategory(idToDelete);

      // 2. Cập nhật UI ngay lập tức (Optimistic Update)
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== idToDelete)
      );

      toast.success("Đã xóa danh mục thành công.");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Xóa danh mục thất bại.", {
          description: "Có thể danh mục này đang được sử dụng bởi một sự kiện.",
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
        <Button asChild>
          <Link href="/admin/categories/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo mới
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Tên danh mục</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  Chưa có danh mục nào.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {cat.description || "..."}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/categories/${cat.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>

                    {/* 3. Sử dụng AlertDialog cho UX tốt hơn */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === cat.id}
                          className="text-red-500 hover:text-red-600"
                        >
                          {deletingId === cat.id ? (
                            <div className="h-4 w-4 border-2 border-dashed rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bạn hoàn toàn chắc chắn?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Thao tác này sẽ
                            xóa vĩnh viễn danh mục <strong>{cat.name}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cat.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Tiếp tục xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

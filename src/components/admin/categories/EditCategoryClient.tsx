// app/(admin)/categories/(id)/edit/EditCategoryClient.tsx
"use client";

import React, { useState } from "react";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import { adminUpdateCategory } from "@/lib/api";
import { Category } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditCategoryClientProps {
  initialData: Category;
}

export default function EditCategoryClient({
  initialData,
}: EditCategoryClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Không cần useEffect để fetch dữ liệu nữa!

  const handleUpdateCategory = async (data: Partial<Category>) => {
    setIsSubmitting(true);
    try {
      await adminUpdateCategory(initialData.id, data);
      toast.success("Cập nhật danh mục thành công.");
      router.push("/admin/categories");
      router.refresh(); // Làm mới danh sách ở trang trước
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Vui lòng thử lại.";
      toast.error("Cập nhật thất bại.", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Không cần state loading hay error nữa!
  return (
    <CategoryForm
      // Truyền dữ liệu ban đầu để điền vào form
      initialData={initialData}
      // Truyền hàm submit
      onSubmit={handleUpdateCategory}
      // Truyền state loading
      isLoading={isSubmitting}
      // Báo cho form biết đây là chế độ sửa
      isEditMode={true}
    />
  );
}

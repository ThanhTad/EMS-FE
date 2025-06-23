// app/(admin)/categories/new/CreateCategoryClient.tsx
"use client";

import React, { useState } from "react";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import { adminCreateCategory } from "@/lib/api";
import { CategoryRequest } from "@/types"; // Sử dụng type này cho nhất quán
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateCategoryClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCategory = async (data: CategoryRequest) => {
    setIsSubmitting(true);
    try {
      await adminCreateCategory(data);
      toast.success("Tạo danh mục thành công.");
      router.push("/admin/categories");
      router.refresh(); // Cần thiết để làm mới danh sách ở trang trước
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Vui lòng thử lại.";
      toast.error("Tạo danh mục thất bại.", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CategoryForm
      // Truyền hàm submit
      onSubmit={handleCreateCategory}
      // Truyền state loading
      isLoading={isSubmitting}
      // Báo cho form biết đây là chế độ tạo mới
      isEditMode={false}
    />
  );
}

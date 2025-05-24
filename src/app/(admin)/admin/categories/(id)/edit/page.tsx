// app/(admin)/categories/(id)/edit/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import { adminGetCategoryById, adminUpdateCategory } from "@/lib/api";
import { UpdateCategoryRequest, Category } from "@/types";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

export default function AdminEditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [initialData, setInitialData] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    setIsLoading(true);
    adminGetCategoryById(categoryId)
      .then(setInitialData)
      .catch(() => toast.error("Không thể tải danh mục"))
      .finally(() => setIsLoading(false));
  }, [categoryId]);

  const handleUpdateCategory = async (data: UpdateCategoryRequest) => {
    if (!categoryId) return;
    setIsSubmitting(true);
    try {
      await adminUpdateCategory(categoryId, data);
      toast.success("Cập nhật thành công");
      router.push("/admin/categories");
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (!initialData) return <div>Không tìm thấy danh mục</div>;

  return (
    <div className="space-y-6">
      <CategoryForm
        initialData={initialData}
        onSubmit={handleUpdateCategory}
        isLoading={isSubmitting}
        isEditMode={true}
      />
    </div>
  );
}

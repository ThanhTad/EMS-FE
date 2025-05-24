// app/(admin)/categories/new/page.tsx
"use client";

import React, { useState } from "react";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import { adminCreateCategory } from "@/lib/api";
import { CreateCategoryRequest } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminCreateCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCategory = async (data: CreateCategoryRequest) => {
    setIsLoading(true);
    try {
      await adminCreateCategory(data);
      toast.success("Tạo danh mục thành công");
      router.push("/admin/categories");
    } catch {
      toast.error("Tạo danh mục thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <CategoryForm
        onSubmit={handleCreateCategory}
        isLoading={isLoading}
        isEditMode={false}
      />
    </div>
  );
}

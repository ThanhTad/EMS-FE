// components/admin/events/CategoryForm.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { CategoryRequest, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (data: CategoryRequest) => Promise<void>;
  isLoading: boolean;
  isEditMode?: boolean;
}

export default function CategoryForm({
  initialData,
  onSubmit,
  isLoading,
  isEditMode = false, // Cung cấp giá trị mặc định
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryRequest>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const buttonText = isEditMode ? "Cập nhật danh mục" : "Tạo danh mục";

  return (
    // Cải tiến: handleSubmit đã bao gồm e.preventDefault()
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Cải tiến: Sử dụng fieldset để vô hiệu hóa toàn bộ form khi loading */}
      <fieldset disabled={isLoading} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên danh mục</Label>
          <Input
            id="name"
            placeholder="Ví dụ: Âm nhạc, Thể thao"
            {...register("name", { required: "Tên danh mục là bắt buộc" })}
          />
          {errors.name && (
            <p className="text-sm font-medium text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả (Tùy chọn)</Label>
          <Textarea
            id="description"
            placeholder="Mô tả ngắn về danh mục này"
            {...register("description")}
          />
        </div>
      </fieldset>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {/* Cải tiến: Thêm icon loading để cải thiện UX */}
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonText}
      </Button>
    </form>
  );
}

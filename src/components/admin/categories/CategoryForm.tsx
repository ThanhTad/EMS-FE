// components/admin/events/EventActionsCell.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { CreateCategoryRequest, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  isLoading: boolean;
  isEditMode?: boolean;
}

export default function CategoryForm({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCategoryRequest>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md mx-auto"
    >
      <div>
        <Label htmlFor="name">Tên danh mục</Label>
        <Input
          id="name"
          {...register("name", { required: "Tên danh mục là bắt buộc" })}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          {...register("description")}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isEditMode ? "Cập nhật danh mục" : "Tạo danh mục"}
      </Button>
    </form>
  );
}

"use client";

import React, { useTransition } from "react";
import UserForm from "@/components/admin/users/UserForm";
import { adminCreateUser } from "@/lib/api";
import { AdminCreateUserRequest, ApiErrorResponse } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateUserClient() {
  const router = useRouter();
  // 1. SỬ DỤNG useTransition ĐỂ CÓ TRẢI NGHIỆM LOADING TỐT HƠN
  const [isPending, startTransition] = useTransition();

  const handleCreateUser = async (data: AdminCreateUserRequest) => {
    startTransition(async () => {
      try {
        const newUser = await adminCreateUser(data);
        toast.success("Tạo thành công", {
          description: `Người dùng "${newUser.username}" đã được tạo.`,
        });

        // 2. ĐẢM BẢO DỮ LIỆU MỚI
        // router.refresh() sẽ làm mới dữ liệu của trang hiện tại và các trang khác
        // Sau đó router.push() sẽ điều hướng đến trang danh sách với dữ liệu đã được cập nhật
        router.refresh();
        router.push("/admin/users");
      } catch (error) {
        // 3. XỬ LÝ LỖI CHI TIẾT HƠN
        const errorResponse = error as ApiErrorResponse;
        const message = errorResponse.message || "Không thể tạo người dùng.";
        // Hiển thị các lỗi validation nếu có
        const validationErrors = errorResponse.errors
          ?.map((e) => `${e.field}: ${e.message}`)
          .join("\n");

        toast.error("Tạo thất bại", {
          description: validationErrors || message,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <UserForm
        onSubmit={handleCreateUser}
        isLoading={isPending} // Dùng isPending từ useTransition
        isEditMode={false}
      />
    </div>
  );
}

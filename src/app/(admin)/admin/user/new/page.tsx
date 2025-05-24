// app/(admin)/users/new/page.tsx

"use client";

import React, { useState } from "react";
import UserForm from "@/components/admin/users/UserForm";
import { adminCreateUser } from "@/lib/api";
import { AdminCreateUserRequest } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminCreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (data: AdminCreateUserRequest) => {
    setIsLoading(true);
    try {
      await adminCreateUser(data);
      toast.success("Thành công", {
        description: `Người dùng ${data.username} đã được tạo.`,
      });
      router.push("/admin/users");
      // Nếu trang /admin/users đã tự fetch dữ liệu, có thể bỏ router.refresh()
    } catch (error) {
      let message = "Không thể tạo người dùng.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error("Tạo thất bại", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <UserForm
        onSubmit={handleCreateUser}
        isLoading={isLoading}
        isEditMode={false}
      />
    </div>
  );
}

"use client";

import React, { useTransition } from "react";
import UserForm from "@/components/admin/users/UserForm";
import { adminUpdateUser } from "@/lib/api";
import { User, AdminUpdateUserRequest, ApiErrorResponse } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Component giờ đây nhận initialData làm prop
interface EditUserClientProps {
  initialData: User;
}

export default function EditUserClient({ initialData }: EditUserClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const userId = initialData.id;

  const handleUpdateUser = async (data: AdminUpdateUserRequest) => {
    startTransition(async () => {
      try {
        await adminUpdateUser(userId, data);
        toast.success("Cập nhật thành công", {
          description: `Thông tin người dùng "${initialData.username}" đã được cập nhật.`,
        });

        // Luôn refresh trước khi push để đảm bảo cache được làm mới
        router.refresh();
        router.push("/admin/users");
      } catch (error) {
        const errorResponse = error as ApiErrorResponse;
        const message =
          errorResponse.message || "Không thể cập nhật người dùng.";
        toast.error("Cập nhật thất bại", { description: message });
      }
    });
  };

  // Không cần logic fetch, loading, hay error nữa. Chỉ cần render form.
  return (
    <div className="space-y-6">
      <UserForm
        initialData={initialData}
        onSubmit={handleUpdateUser}
        isLoading={isPending}
        isEditMode={true}
      />
    </div>
  );
}

// app/(admin)/users/(id)/edit/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserForm from "@/components/admin/users/UserForm";
import { adminGetUserById, adminUpdateUser } from "@/lib/api";
import { User, AdminUpdateUserRequest } from "@/types";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

// Skeleton cho form khi đang load initialData
function UserFormSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-36" />
      </CardFooter>
    </Card>
  );
}

export default function AdminEditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [initialUserData, setInitialUserData] = useState<User | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      toast.error("Thiếu thông tin", {
        description: "Không tìm thấy ID người dùng.",
      });
      setFetchError("Không tìm thấy ID người dùng.");
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const response = await adminGetUserById(userId);
      setInitialUserData(response);
    } catch (error) {
      let message = "Không thể tải dữ liệu người dùng.";
      if (error instanceof Error) {
        message = error.message;
      }
      setFetchError(message);
      toast.error("Lỗi", {
        description: `Không thể tải dữ liệu cho người dùng ${userId}: ${message}`,
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleUpdateUser = async (data: AdminUpdateUserRequest) => {
    if (!userId) {
      toast.error("Lỗi xác thực", { description: "Vui lòng đăng nhập lại." });
      return;
    }
    setIsSubmitting(true);
    try {
      await adminUpdateUser(userId, data);
      toast.success("Thành công", {
        description: "Thông tin người dùng đã được cập nhật.",
      });
      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      let message = "Không thể cập nhật người dùng.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error("Cập nhật thất bại", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <UserFormSkeleton />
      </div>
    );
  }

  if (fetchError || !initialUserData) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>
            {fetchError || "Không tìm thấy người dùng này."}
          </AlertDescription>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/admin/users">Quay lại danh sách</Link>
          </Button>
          {/* Optional: Thêm nút thử lại */}
          {/* <Button onClick={fetchUserData} className="mt-4" variant="secondary">Thử lại</Button> */}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserForm
        initialData={initialUserData}
        onSubmit={handleUpdateUser}
        isLoading={isSubmitting}
        isEditMode={true}
      />
    </div>
  );
}

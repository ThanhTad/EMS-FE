// app/(main)/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import AvatarUploader from "@/components/features/AvatarUploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// FIX 1: Import đúng hàm uploadAvatar từ file api
import { uploadAvatar } from "@/lib/api";
import { Loader2 } from "lucide-react";

// Đảm bảo NEXT_PUBLIC_API_URL không có dấu / ở cuối
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// IMPROVEMENT 3: Thêm ràng buộc để không cho phép chuỗi rỗng nếu người dùng đã nhập
const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ và tên không được để trống.")
    .max(100)
    .optional()
    .or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfilePageContent() {
  const {
    profile,
    loading,
    error,
    saveProfile: updateProfile,
    refetch,
  } = useUserProfile();

  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    // FIX 1: Thêm lại profile.id khi gọi updateProfile
    if (!profile?.id) {
      toast.error("Không xác định được người dùng. Vui lòng tải lại trang.");
      return;
    }

    setIsSaving(true);
    try {
      // Dùng updateProfile đã có từ hook
      await updateProfile(profile.id, {
        fullName: values.fullName || undefined,
        phone: values.phone || undefined,
      });
      toast.success("Cập nhật hồ sơ thành công");
      // hook `useUserProfile` nên tự động refetch sau khi save thành công
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSave = async (blob: Blob) => {
    setIsSaving(true);
    try {
      // FIX 1: Sử dụng đúng hàm `uploadAvatar` và không cần truyền ID
      await uploadAvatar(blob);

      // Sau khi upload thành công, refetch lại data để UI cập nhật avatar mới
      await refetch();
      toast.success("Cập nhật avatar thành công");
    } catch (err) {
      console.error("Error updating avatar:", err);
      toast.error("Cập nhật avatar thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-8 pt-10">
          <div className="flex flex-col items-center">
            <Skeleton className="h-28 w-28 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">
          Lỗi tải hồ sơ: {error || "Không tìm thấy thông tin người dùng."}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  // Xử lý URL an toàn
  const avatarSrc = profile.avatarUrl
    ? profile.avatarUrl.startsWith("http")
      ? profile.avatarUrl
      : `${API_URL}${profile.avatarUrl}`
    : "/imgs/default-avatar.png";

  return (
    <div className="container max-w-xl py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Hồ sơ của bạn</h1>
      <Card className="bg-card shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>
            Cập nhật tên, điện thoại hoặc avatar của bạn.
          </CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 pt-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-28 h-28 ring-2 ring-primary">
                  <AvatarImage src={avatarSrc} alt="Avatar" />
                  <AvatarFallback className="text-2xl">
                    {profile.fullName?.substring(0, 2) ||
                      profile.username.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <AvatarUploader
                    onSave={handleAvatarSave}
                    disabled={isSaving}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                JPG, PNG. Tối đa 2MB.
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  placeholder="Nhập họ và tên"
                  {...form.register("fullName")}
                  disabled={isSaving}
                  className="mt-1"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  {...form.register("phone")}
                  disabled={isSaving}
                  className="mt-1"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end bg-muted/50 py-4 px-6 border-t">
            <Button
              type="submit"
              disabled={isSaving || !form.formState.isDirty}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

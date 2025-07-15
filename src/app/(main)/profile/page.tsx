// app/(main)/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { uploadAvatar } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { UserProfileUpdateRequest } from "@/types";

// Schema validation chặt chẽ hơn
const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(100, "Họ tên không quá 100 ký tự.")
    .optional(),
  phone: z
    .string()
    .trim()
    .max(20, "Số điện thoại không quá 20 ký tự.")
    .optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfilePageContent() {
  const { profile, loading, error, saveProfile, refetch } = useUserProfile();

  // Tách biệt state loading cho từng hành động
  const [isFormSaving, setIsFormSaving] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "" },
  });

  // Đồng bộ dữ liệu từ hook vào form khi có
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, form]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    setIsFormSaving(true);
    try {
      // Payload chỉ chứa các trường được phép
      const payload: UserProfileUpdateRequest = {
        email: profile?.email, // thêm
        username: profile?.username,
        id: profile?.id,
        fullName: values.fullName,
        phone: values.phone,
      };
      await saveProfile(payload);
      toast.success("Cập nhật hồ sơ thành công!");
      // Hook `useUserProfile` đã tự revalidate, và useEffect sẽ reset lại form
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cập nhật thất bại.";
      toast.error("Cập nhật hồ sơ thất bại: " + message);
    } finally {
      setIsFormSaving(false);
    }
  };

  const handleAvatarSave = async (blob: Blob) => {
    setIsAvatarSaving(true);
    try {
      await uploadAvatar(blob);
      toast.success("Cập nhật avatar thành công!");
    } catch (err) {
      console.error("Avatar update error:", err);
      toast.error("Cập nhật avatar thất bại.");
    } finally {
      setIsAvatarSaving(false);
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
          Lỗi tải hồ sơ:{" "}
          {error?.message || "Không tìm thấy thông tin người dùng."}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  const isSaving = isFormSaving || isAvatarSaving;
  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
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
          <CardDescription>Cập nhật thông tin của bạn.</CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 pt-8">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-28 h-28 ring-2 ring-primary ring-offset-2 ring-offset-background">
                <AvatarImage src={avatarSrc} alt={profile.username} />
                <AvatarFallback className="text-3xl">
                  {profile.username?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <AvatarUploader onSave={handleAvatarSave} disabled={isSaving} />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className="mt-1 bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  value={profile.username}
                  readOnly
                  disabled
                  className="mt-1 bg-muted/50"
                />
              </div>
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
              {isFormSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu thay đổi
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
      <main className="w-full flex justify-center py-8 sm:py-12">
        <ProfilePageContent />
      </main>
    </ProtectedRoute>
  );
}

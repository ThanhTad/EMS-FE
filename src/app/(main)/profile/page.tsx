// app/(main)/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserProfileUpdateRequest } from "@/types";
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

const profileSchema = z.object({
  fullName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfilePageContent() {
  const {
    profile,
    loading,
    error,
    saveProfile: updateProfile,
  } = useUserProfile();

  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!profile?.id) {
      toast("Không xác định được ID người dùng");
      return;
    }
    setIsSaving(true);
    try {
      const payload: UserProfileUpdateRequest = {
        fullName: values.fullName,
        phone: values.phone,
      };
      await updateProfile(profile.id, payload); // chắc chắn profile.id là string
      toast("Cập nhật hồ sơ thành công");
    } catch (err) {
      console.error(err);
      toast("Cập nhật thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSave = async (blob: Blob) => {
    if (!profile?.id) {
      toast("Không xác định được ID người dùng");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", blob);

      const res = await fetch(`/api/users/${profile.id}/avatar`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload avatar failed");
      const data = await res.json();
      const url = data.data.url;

      await updateProfile(profile.id, { avatarUrl: url });
      toast("Cập nhật avatar thành công");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error updating avatar:", err.message);
      }
      toast("Cập nhật avatar thất bại");
    }
  };

  if (loading) {
    return (
      <div className="container py-10 text-gray-900 dark:text-gray-100">
        <Skeleton className="h-8 w-48 mb-6 dark:bg-gray-700" />
        <Skeleton className="h-40 w-40 rounded-full mx-auto mb-6 dark:bg-gray-700" />
        <Skeleton className="h-6 w-full mb-4 dark:bg-gray-700" />
        <Skeleton className="h-6 w-full mb-4 dark:bg-gray-700" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-10 text-gray-900 dark:text-gray-100">
        <p className="text-destructive dark:text-destructive-foreground">
          Lỗi tải profile: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Hồ sơ của bạn</h1>
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-gray-900 dark:text-white">
            Thông tin cá nhân
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Cập nhật tên, điện thoại hoặc avatar của bạn.
          </CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={profile.avatarUrl || "/images/default-avatar.png"}
                  alt="Avatar"
                />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
                  {profile.fullName
                    ? profile.fullName.slice(0, 2).toUpperCase()
                    : profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <AvatarUploader onSave={handleAvatarSave} />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-gray-800 dark:text-gray-100"
              >
                Họ và tên
              </Label>
              <Input
                id="fullName"
                placeholder="Họ và tên"
                {...form.register("fullName")}
                disabled={isSaving}
                className="dark:bg-gray-700 dark:text-white"
              />
              {form.formState.errors.fullName && (
                <p className="text-red-600 dark:text-red-400 text-xs">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-gray-800 dark:text-gray-100"
              >
                Số điện thoại
              </Label>
              <Input
                id="phone"
                placeholder="Số điện thoại"
                {...form.register("phone")}
                disabled={isSaving}
                className="dark:bg-gray-700 dark:text-white"
              />
              {form.formState.errors.phone && (
                <p className="text-red-600 dark:text-red-400 text-xs">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="avatarUrl"
                className="text-gray-800 dark:text-gray-100"
              >
                URL Avatar
              </Label>
              <Input
                id="avatarUrl"
                placeholder="https://..."
                {...form.register("avatarUrl")}
                disabled={isSaving}
                className="dark:bg-gray-700 dark:text-white"
              />
              {form.formState.errors.avatarUrl && (
                <p className="text-red-600 dark:text-red-400 text-xs">
                  {form.formState.errors.avatarUrl.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="dark:bg-primary dark:text-white"
            >
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

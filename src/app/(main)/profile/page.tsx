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
import { cn } from "@/lib/utils";
import { uploadUserAvatar } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const profileSchema = z.object({
  fullName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfilePageContent() {
  const {
    profile,
    loading,
    error,
    saveProfile: updateProfile,
    refetch, // <-- thêm refetch hoặc mutate nếu hook có
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
        fullName: profile.fullName,
        phone: profile.phone,
      });
      console.log("Profile loaded:", profile.avatarUrl);
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
      await updateProfile(profile.id, payload);
      toast("Cập nhật hồ sơ thành công");
      if (typeof refetch === "function") await refetch();
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
    setIsSaving(true);
    try {
      const url = await uploadUserAvatar(profile.id, blob);
      if (!url) throw new Error("Upload avatar failed");
      // Sau upload, refetch lại profile cho avatar mới
      if (typeof refetch === "function") await refetch();
      toast("Cập nhật avatar thành công");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error updating avatar:", err.message);
      }
      toast("Cập nhật avatar thất bại");
    } finally {
      setIsSaving(false);
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
    <div className="container max-w-xl py-10 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 dark:text-white text-center">
        Hồ sơ của bạn
      </h1>
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <CardTitle className="text-gray-900 dark:text-white text-lg md:text-xl">
            Thông tin cá nhân
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Cập nhật tên, điện thoại hoặc avatar của bạn.
          </CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 md:space-y-8 pt-6 md:pt-10">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="w-28 h-28 ring-2 ring-primary transition-all duration-200 group-hover:ring-4 mb-2">
                  <AvatarImage
                    src={
                      profile.avatarUrl
                        ? profile.avatarUrl.startsWith("http")
                          ? profile.avatarUrl
                          : `${API_URL}${profile.avatarUrl}`
                        : "/imgs/default-avatar.png"
                    }
                    alt="Avatar"
                  />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-2xl">
                    {profile.fullName
                      ? profile.fullName.slice(0, 2).toUpperCase()
                      : profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <AvatarUploader onSave={handleAvatarSave} />
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Định dạng: JPG, PNG. Kích thước tối đa ~2MB.
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label
                  htmlFor="fullName"
                  className="text-gray-800 dark:text-gray-100 mb-1"
                >
                  Họ và tên
                </Label>
                <Input
                  id="fullName"
                  placeholder="Họ và tên"
                  {...form.register("fullName")}
                  disabled={isSaving}
                  className={cn(
                    "dark:bg-gray-700 dark:text-white mt-1",
                    form.formState.errors.fullName && "border-red-500"
                  )}
                />
                {form.formState.errors.fullName && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="text-gray-800 dark:text-gray-100 mb-1"
                >
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  placeholder="Số điện thoại"
                  {...form.register("phone")}
                  disabled={isSaving}
                  className={cn(
                    "dark:bg-gray-700 dark:text-white mt-1",
                    form.formState.errors.phone && "border-red-500"
                  )}
                />
                {form.formState.errors.phone && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end py-6 px-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
            <Button
              type="submit"
              disabled={isSaving}
              className="dark:bg-primary dark:text-white min-w-[140px] font-semibold text-base"
            >
              {isSaving ? (
                <span>
                  <svg
                    className="inline w-4 h-4 mr-2 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  Đang lưu...
                </span>
              ) : (
                "Lưu thay đổi"
              )}
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

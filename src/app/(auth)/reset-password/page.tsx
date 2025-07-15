// app/(auth)/reset-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { toast } from "sonner";
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
import { Loader2, KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react"; // Thêm Eye, EyeOff, ArrowLeft
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Import cn

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự.")
      .max(64, "Mật khẩu mới tối đa 64 ký tự.")
      .regex(
        passwordRegex,
        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt."
      ),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { resetPassword } = usePasswordReset();

  const email = params.get("identifier");
  const resetToken = params.get("resetToken");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email || !resetToken) {
      toast.error(
        "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại từ bước quên mật khẩu."
      );
      router.replace("/forgot-password");
    }
  }, [email, resetToken, router]);

  const form = useForm<ResetFormValues>({
    // Đổi tên biến form
    resolver: zodResolver(resetSchema),
    mode: "onTouched", // Hiển thị lỗi sớm
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (!email || !resetToken) {
      toast.error("Thông tin đặt lại mật khẩu không đầy đủ.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword({
        email,
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success(
        "Mật khẩu của bạn đã được đặt lại thành công! Bạn có thể đăng nhập bằng mật khẩu mới."
      );
      router.push("/login");
    } catch (err: unknown) {
      let msg = "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          msg = errorData.message || msg;
        } catch {
          msg = err.message;
        }
      }
      // Xử lý lỗi token hết hạn hoặc không hợp lệ cụ thể hơn
      if (
        msg.toLowerCase().includes("token") ||
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("invalid")
      ) {
        toast.error(
          "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại."
        );
        router.push("/forgot-password"); // Chuyển về trang forgot-password
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email || !resetToken) {
    // Có thể hiển thị một spinner hoặc thông báo loading ở đây trong khi useEffect chạy
    return (
      <div className="flex min-h-[95vh] items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[95vh] items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-700 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md" // Tăng max-width
      >
        <Card className="relative bg-white/90 dark:bg-gray-900/90 shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-indigo-400 blur-2xl opacity-30 dark:bg-indigo-800 pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-purple-400 blur-2xl opacity-30 dark:bg-purple-800 pointer-events-none" />

          <CardHeader className="border-b border-gray-200 dark:border-gray-700 text-center p-6">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 shadow-md">
                <KeyRound className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
              </span>
              <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
                Tạo mật khẩu mới
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Nhập mật khẩu mới mạnh mẽ cho tài khoản của bạn.
                {email && (
                  <p className="font-medium text-indigo-600 dark:text-indigo-400 mt-1 break-all">
                    {email}
                  </p>
                )}
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 p-6">
              {/* New Password */}
              <div className="space-y-1">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Mật khẩu mới
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    {...form.register("newPassword")}
                    disabled={isSubmitting}
                    className={cn(
                      "pl-10 pr-10 py-2 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500",
                      form.formState.errors.newPassword &&
                        "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
                    )}
                    aria-invalid={
                      form.formState.errors.newPassword ? "true" : "false"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label={
                      showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.newPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {form.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Xác nhận mật khẩu mới
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    {...form.register("confirmPassword")}
                    disabled={isSubmitting}
                    className={cn(
                      "pl-10 pr-10 py-2 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500",
                      form.formState.errors.confirmPassword &&
                        "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
                    )}
                    aria-invalid={
                      form.formState.errors.confirmPassword ? "true" : "false"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label={
                      showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 p-6 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? "Đang lưu..." : "Lưu mật khẩu mới"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/login")}
                className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Hủy và quay lại Đăng nhập
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

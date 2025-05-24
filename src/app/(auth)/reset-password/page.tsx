// app/(auth)/reset-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { usePasswordReset } from "@/hooks/usePasswordReset";
import { useTwoFactor } from "@/hooks/useTwoFactor";
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
import { Loader2, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { OtpType } from "@/types";
import { motion } from "framer-motion";

const resetSchema = z
  .object({
    email: z.string().email("Email không hợp lệ."),
    otp: z.string().length(6, "Mã OTP phải gồm 6 chữ số"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = usePasswordReset();
  const { resendOtp } = useTwoFactor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const emailValue = watch("email");

  const onSubmit = async (data: ResetFormValues) => {
    setIsSubmitting(true);
    try {
      await resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập lại.");
      router.push("/login");
    } catch (err: unknown) {
      let msg = "Đặt lại mật khẩu thất bại.";
      if (err instanceof Error) msg = err.message;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!emailValue || cooldown > 0) return;
    setIsResending(true);
    try {
      await resendOtp(emailValue, OtpType.PASSWORD_RESET);
      toast.success("Đã gửi lại mã OTP. Vui lòng kiểm tra email.");
      setCooldown(60);
    } catch (err: unknown) {
      let msg = "Gửi lại thất bại.";
      if (err instanceof Error) msg = err.message;
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-700">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <Card className="relative bg-white/90 dark:bg-gray-900/90 shadow-2xl border-0 rounded-2xl overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-indigo-400 blur-2xl opacity-40 dark:bg-indigo-800 pointer-events-none" />
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 shadow">
                <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
              </span>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                Đặt lại mật khẩu
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Nhập email, mã OTP và mật khẩu mới để hoàn tất.
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 mt-2">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-800 dark:text-gray-100"
                >
                  Email
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={isSubmitting || isResending}
                    className="pl-10 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* OTP */}
              <div className="space-y-2">
                <Label
                  htmlFor="otp"
                  className="text-gray-800 dark:text-gray-100"
                >
                  Mã OTP
                </Label>
                <div className="flex gap-2 items-center">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    <Input
                      id="otp"
                      maxLength={6}
                      {...register("otp")}
                      disabled={isSubmitting}
                      className="pl-10 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResend}
                    disabled={isResending || isSubmitting || cooldown > 0}
                    className="dark:border-gray-600 dark:text-gray-100 whitespace-nowrap"
                    type="button"
                  >
                    {cooldown > 0 ? (
                      `Gửi lại sau ${cooldown}s`
                    ) : isResending ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin inline" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi lại mã OTP"
                    )}
                  </Button>
                </div>
                {errors.otp && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.otp.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-gray-800 dark:text-gray-100"
                >
                  Mật khẩu mới
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <Input
                    id="newPassword"
                    type="password"
                    {...register("newPassword")}
                    disabled={isSubmitting}
                    className="pl-10 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-800 dark:text-gray-100"
                >
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    disabled={isSubmitting}
                    className="pl-10 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 mt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
                size="lg"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePasswordReset } from "@/hooks/usePasswordReset"; // Giả định hook này tồn tại và hoạt động
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
import { Mail, Loader2, ArrowLeft, KeyRound } from "lucide-react"; // Thêm KeyRound
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Import cn

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email.")
    .email("Địa chỉ email không hợp lệ."),
});
type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = usePasswordReset();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ForgotFormValues>({
    // Đổi tên biến form cho nhất quán
    resolver: zodResolver(forgotSchema),
    mode: "onTouched", // Hiển thị lỗi sớm
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsSubmitting(true);
    try {
      await requestPasswordReset(data.email);
      toast.success(
        "Yêu cầu đã được gửi! Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã OTP."
      );
      router.push(
        `/otp?mode=forgot-password&email=${encodeURIComponent(data.email)}`
      );
    } catch (err: unknown) {
      let msg = "Đã có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.";
      if (err instanceof Error) {
        // Cố gắng parse lỗi từ API nếu có
        try {
          const errorData = JSON.parse(err.message);
          msg = errorData.message || msg;
        } catch {
          msg = err.message;
        }
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 text-center p-6">
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 shadow-md">
                  <KeyRound className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
                </span>
                <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
                  Quên mật khẩu?
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Đừng lo lắng! Nhập email của bạn để chúng tôi gửi mã OTP đặt
                  lại mật khẩu.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập địa chỉ email của bạn"
                    autoComplete="email"
                    {...form.register("email")}
                    disabled={isSubmitting}
                    className={cn(
                      "pl-10 pr-3 py-2 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500",
                      form.formState.errors.email &&
                        "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
                    )}
                    aria-invalid={
                      form.formState.errors.email ? "true" : "false"
                    }
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {form.formState.errors.email.message}
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
                  <Mail className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? "Đang gửi..." : "Gửi mã đặt lại"}
              </Button>
              <Button
                type="button"
                variant="ghost" // Sử dụng ghost cho ít nổi bật hơn
                onClick={() => router.push("/login")}
                className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quay lại Đăng nhập
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

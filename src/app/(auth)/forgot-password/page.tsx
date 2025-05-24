// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
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
import { Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const forgotSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ."),
});
type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = usePasswordReset();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsSubmitting(true);
    try {
      await requestPasswordReset(data.email);
      toast.success(
        "Nếu có tài khoản với email này, một mã OTP đã được gửi. Vui lòng kiểm tra hộp thư."
      );
    } catch (err: unknown) {
      let msg = "Đã có lỗi xảy ra. Vui lòng thử lại.";
      if (err instanceof Error) msg = err.message;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-700">
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
                <Mail className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
              </span>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                Quên mật khẩu
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Nhập email để nhận mã OTP đặt lại mật khẩu.
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 mt-2">
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
                    placeholder="you@example.com"
                    {...register("email")}
                    disabled={isSubmitting}
                    className="pl-10 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.email.message}
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
                {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

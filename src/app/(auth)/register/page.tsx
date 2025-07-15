// app/(auth)/register/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Loader2,
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Giả sử bạn có file này từ shadcn/ui

// Define Zod schema for registration
const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự."),
  email: z.string().email("Địa chỉ email không hợp lệ."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
  fullName: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{10,11}$/.test(value), {
      // Ví dụ: Validate SĐT Việt Nam (10-11 số)
      message: "Số điện thoại không hợp lệ.",
    }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched", // Hiển thị lỗi khi người dùng tương tác xong với trường
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    if (lockoutUntil && new Date() < lockoutUntil) {
      toast.error(
        `Vui lòng thử lại sau ${Math.ceil(
          (lockoutUntil.getTime() - new Date().getTime()) / 1000
        )} giây`
      );
      return;
    }

    if (attemptCount >= 5) {
      const lockoutTime = new Date();
      lockoutTime.setMinutes(lockoutTime.getMinutes() + 15); // Lockout for 15 minutes
      setLockoutUntil(lockoutTime);
      setAttemptCount(0); // Reset attempt count after locking
      toast.error("Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.");
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName || undefined,
        phone: values.phone || undefined,
      });

      setAttemptCount(0);
      setLockoutUntil(null);

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      router.push(
        `/otp?mode=verify-email&identifier=${encodeURIComponent(values.email)}`
      );
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      setAttemptCount((prev) => prev + 1);

      let message = "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message); // Assuming API error is JSON string
          message = errorData.message || message;
        } catch {
          message = error.message;
        }
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[95vh] items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-700 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md" // Tăng max-w một chút để form rộng hơn
      >
        <Card className="relative bg-white/90 dark:bg-gray-900/90 shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-indigo-400 blur-2xl opacity-30 dark:bg-indigo-800 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-purple-400 blur-2xl opacity-30 dark:bg-purple-800 pointer-events-none" />

          <CardHeader className="border-b border-gray-200 dark:border-gray-700 text-center p-6">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 shadow-md">
                <UserPlus className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
              </span>
              <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
                Tạo tài khoản
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Bắt đầu hành trình khám phá sự kiện cùng chúng tôi.
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 p-6">
              {/* Username */}
              <div className="space-y-1">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Tên đăng nhập
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <User className="h-5 w-5" />
                  </span>
                  <Input
                    id="username"
                    placeholder="Tài khoản của bạn"
                    {...form.register("username")}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 pr-3 py-2 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500",
                      form.formState.errors.username &&
                        "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
                    )}
                    aria-invalid={
                      form.formState.errors.username ? "true" : "false"
                    }
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
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
                    placeholder="Địa chỉ email của bạn"
                    {...form.register("email")}
                    disabled={isLoading}
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

              {/* Password */}
              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Mật khẩu
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu (ít nhất 6 ký tự)"
                    {...form.register("password")}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 pr-10 py-2 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500",
                      form.formState.errors.password &&
                        "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
                    )}
                    aria-invalid={
                      form.formState.errors.password ? "true" : "false"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Full Name (Optional) */}
              <div className="space-y-1">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Họ và tên{" "}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    (Tùy chọn)
                  </span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <User className="h-5 w-5" />
                  </span>
                  <Input
                    id="fullName"
                    placeholder="Tên đầy đủ của bạn"
                    {...form.register("fullName")}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 pr-3 py-2 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      // Không cần style lỗi cho trường optional trừ khi có validation cụ thể
                    )}
                  />
                </div>
                {/* Không hiển thị lỗi cho trường optional trừ khi có rule validation */}
              </div>

              {/* Phone Number (Optional) */}
              <div className="space-y-1">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Số điện thoại{" "}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    (Tùy chọn)
                  </span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Phone className="h-5 w-5" />
                  </span>
                  <Input
                    id="phone" // Sửa id từ "phoneNumber" thành "phone" để khớp với register
                    placeholder="Số điện thoại của bạn"
                    {...form.register("phone")}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 pr-3 py-2 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500",
                      form.formState.errors.phone &&
                        "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
                    )}
                    aria-invalid={
                      form.formState.errors.phone ? "true" : "false"
                    }
                  />
                </div>
                {form.formState.errors.phone && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 p-6 pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                disabled={
                  isLoading || !!(lockoutUntil && new Date() < lockoutUntil)
                }
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-5 w-5" />
                )}
                {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </Button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

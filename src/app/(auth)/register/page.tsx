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
import { Loader2, UserPlus, User, Mail, Lock, Phone } from "lucide-react";
import { motion } from "framer-motion";

// Define Zod schema for registration
const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự."),
  email: z.string().email("Địa chỉ email không hợp lệ."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
  fullName: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      console.log("Registering user:", values);
      await registerUser(values);
      toast("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      router.push("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      toast("Đăng ký thất bại. Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[95vh] items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-700">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <Card className="relative bg-white/90 dark:bg-gray-900/90 shadow-2xl border-0 rounded-2xl overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-indigo-400 blur-2xl opacity-40 dark:bg-indigo-800 pointer-events-none" />
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 shadow">
                <UserPlus className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
              </span>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                Đăng ký
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Tạo tài khoản mới để bắt đầu khám phá sự kiện.
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 mt-2">
              {/* Username */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-gray-800 dark:text-gray-100"
                >
                  Tên đăng nhập
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <User className="h-5 w-5" />
                  </span>
                  <Input
                    id="username"
                    placeholder="Nhập tên đăng nhập"
                    {...form.register("username")}
                    disabled={isLoading}
                    className="pl-10 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

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
                    placeholder="Nhập email"
                    {...form.register("email")}
                    disabled={isLoading}
                    className="pl-10 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-800 dark:text-gray-100"
                >
                  Mật khẩu
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    {...form.register("password")}
                    disabled={isLoading}
                    className="pl-10 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Full Name (Optional) */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-gray-800 dark:text-gray-100"
                >
                  Họ và tên (Tùy chọn)
                </Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    placeholder="Nhập họ tên"
                    {...form.register("fullName")}
                    disabled={isLoading}
                    className="dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              {/* Phone Number (Optional) */}
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-gray-800 dark:text-gray-100"
                >
                  Số điện thoại (Tùy chọn)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Phone className="h-5 w-5" />
                  </span>
                  <Input
                    id="phone"  
                    placeholder="Nhập số điện thoại"
                    {...form.register("phone")}
                    disabled={isLoading}
                    className="pl-10 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
                disabled={isLoading}
                size="lg"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
              <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

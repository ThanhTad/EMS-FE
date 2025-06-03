// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, LogIn, Lock, User, Eye, EyeOff } from "lucide-react"; // Thêm LogIn, Eye, EyeOff
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Giả sử bạn có file này

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập.")
    .min(3, "Tên đăng nhập ít nhất 3 ký tự."), // Thêm min(1)
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu.")
    .min(6, "Mật khẩu ít nhất 6 ký tự."), // Thêm min(1)
  rememberMe: z.boolean().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [showPassword, setShowPassword] = useState(false); // State cho show/hide password

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched", // Hiển thị lỗi khi người dùng tương tác xong
    defaultValues: { username: "", password: "", rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (lockoutUntil && new Date() < lockoutUntil) {
      const remainingTime = Math.ceil(
        (lockoutUntil.getTime() - new Date().getTime()) / 1000
      );
      toast.error(
        `Quá nhiều lần thử. Vui lòng thử lại sau ${remainingTime} giây.`
      );
      return;
    }

    if (loginAttempts >= 5) {
      const lockoutTime = new Date();
      lockoutTime.setMinutes(lockoutTime.getMinutes() + 15); // Lockout 15 phút
      setLockoutUntil(lockoutTime);
      setLoginAttempts(0); // Reset sau khi lockout
      toast.error("Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({
        // Giả sử login trả về { data: { twoFactorRequired?: boolean, tempToken?: string } }
        username: values.username,
        password: values.password,
      });

      setLoginAttempts(0);
      setLockoutUntil(null);

      const authData = res.data;

      if (authData.twoFactorEnabled) {
        const challengeToken = authData.challengeToken;
        if (challengeToken) {
          sessionStorage.setItem("challengeToken", challengeToken);
        }

        toast.info("Yêu cầu xác thực hai yếu tố. Vui lòng nhập mã OTP.");
        router.push(
          `/otp?mode=login-2fa&identifier=${encodeURIComponent(
            values.username
          )}`
        );
      } else {
        toast.success("Đăng nhập thành công! Chào mừng bạn trở lại.");
        router.push("/");
      }
    } catch (err: unknown) {
      setLoginAttempts((prev) => prev + 1);
      let message =
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message); // Giả sử lỗi từ API là JSON string
          message = errorData.message || message;
        } catch {
          message = err.message;
        }
      }
      toast.error(message); // Bỏ "Đăng nhập thất bại: " vì message từ API có thể đã đủ rõ
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
        className="w-full max-w-md" // Đồng bộ max-width với trang đăng ký
      >
        <Card className="relative bg-white/90 dark:bg-gray-900/90 shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-indigo-400 blur-2xl opacity-30 dark:bg-indigo-800 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-purple-400 blur-2xl opacity-30 dark:bg-purple-800 pointer-events-none" />

          <CardHeader className="border-b border-gray-200 dark:border-gray-700 text-center p-6">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 shadow-md">
                <Lock className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
              </span>
              <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
                Chào mừng trở lại!
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Đăng nhập để tiếp tục quản lý sự kiện của bạn.
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
                  Tên đăng nhập hoặc Email
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <User className="h-5 w-5" />
                  </span>
                  <Input
                    id="username"
                    placeholder="Nhập tên đăng nhập/email"
                    {...form.register("username")}
                    disabled={isLoading}
                    autoComplete="username"
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
                    placeholder="Nhập mật khẩu của bạn"
                    {...form.register("password")}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className={cn(
                      "pl-10 pr-10 py-2 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500", // pr-10 để có không gian cho icon mắt
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={form.watch("rememberMe")}
                    onCheckedChange={(checked) =>
                      form.setValue("rememberMe", Boolean(checked))
                    } // Đảm bảo giá trị là boolean
                    disabled={isLoading}
                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white dark:data-[state=checked]:bg-indigo-500 border-gray-300 dark:border-gray-600"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    Nhớ đăng nhập
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 p-6 pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                disabled={
                  isLoading ||
                  Boolean(lockoutUntil && new Date() < lockoutUntil)
                }
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" /> // Thay icon cho nút login
                )}
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

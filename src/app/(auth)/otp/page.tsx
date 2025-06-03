// app/(auth)/otp/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  UserCheck,
  UserX,
  LogIn,
  Loader2,
} from "lucide-react";
import OTPInput from "@/components/shared/OTPInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { OtpType } from "@/types";
import { motion } from "framer-motion";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Constants
const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;
const DEFAULT_ERROR_MSG =
  "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.";
const RESEND_ERROR_MSG = "Không thể gửi lại mã OTP. Vui lòng thử lại sau.";

// Types
interface OtpConfig {
  otpType: OtpType;
  title: string;
  description: string;
  successMsg: string;
  resendActionName: string;
  redirect: string;
  usePasswordReset: boolean;
  icon: React.ReactNode;
}

// Helper functions
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const maskEmail = (email: string): string => {
  if (!email || !isValidEmail(email)) return "địa chỉ email của bạn";
  return email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, a, b, c) => a + "*".repeat(b.length) + c
  );
};

const parseError = (err: unknown): string => {
  if (err instanceof Error) {
    try {
      const errorData = JSON.parse(err.message);
      return errorData.message || err.message;
    } catch {
      return err.message;
    }
  }
  return "Đã xảy ra lỗi không xác định.";
};

// Helper: Map mode (query) to OtpType, UI text, API verify/resend
function getOtpConfig(mode: string | null): OtpConfig {
  switch (mode) {
    case "verify-email":
      return {
        otpType: OtpType.EMAIL_VERIFICATION,
        title: "Xác thực địa chỉ Email",
        description: `Nhập mã OTP gồm ${OTP_LENGTH} chữ số đã gửi tới email của bạn để hoàn tất đăng ký.`,
        successMsg: "Xác thực email thành công! Bạn có thể đăng nhập.",
        resendActionName: "Gửi lại mã xác thực",
        redirect: "/login",
        usePasswordReset: false,
        icon: <UserCheck className="h-8 w-8 text-green-500" />,
      };
    case "enable-2fa":
      return {
        otpType: OtpType.ENABLE_2FA_VERIFICATION,
        title: "Kích hoạt Xác thực 2 Yếu tố",
        description: `Nhập mã OTP gồm ${OTP_LENGTH} chữ số từ ứng dụng xác thực hoặc email của bạn để bật 2FA.`,
        successMsg: "Xác thực 2 yếu tố đã được kích hoạt!",
        resendActionName: "Gửi lại mã OTP",
        redirect: "/settings",
        usePasswordReset: false,
        icon: (
          <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
        ),
      };
    case "disable-2fa":
      return {
        otpType: OtpType.DISABLE_2FA_VERIFICATION,
        title: "Hủy Xác thực 2 Yếu tố",
        description: `Nhập mã OTP gồm ${OTP_LENGTH} chữ số để xác nhận hủy bỏ 2FA.`,
        successMsg: "Xác thực 2 yếu tố đã được hủy bỏ!",
        resendActionName: "Gửi lại mã OTP",
        redirect: "/settings",
        usePasswordReset: false,
        icon: <UserX className="h-8 w-8 text-red-500" />,
      };
    case "login-2fa":
      return {
        otpType: OtpType.TWO_FACTOR_AUTH_LOGIN,
        title: "Xác thực Đăng nhập",
        description:
          "Nhập mã OTP từ ứng dụng xác thực hoặc email để hoàn tất đăng nhập.",
        successMsg: "Xác thực thành công! Đang chuyển hướng...",
        resendActionName: "Gửi lại mã OTP",
        redirect: "/",
        usePasswordReset: false,
        icon: (
          <LogIn className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
        ),
      };
    case "forgot-password":
      return {
        otpType: OtpType.PASSWORD_RESET,
        title: "Xác thực Đặt lại Mật khẩu",
        description:
          "Nhập mã OTP đã gửi tới email của bạn để tiếp tục quá trình đặt lại mật khẩu.",
        successMsg: "Xác thực thành công! Chuẩn bị đặt lại mật khẩu.",
        resendActionName: "Gửi lại mã OTP",
        redirect: "/reset-password",
        usePasswordReset: true,
        icon: <KeyRound className="h-8 w-8 text-orange-500" />,
      };
    default:
      return {
        otpType: OtpType.EMAIL_VERIFICATION,
        title: "Xác thực OTP",
        description: `Nhập mã OTP gồm ${OTP_LENGTH} chữ số đã gửi đến email của bạn.`,
        successMsg: "Xác thực thành công!",
        resendActionName: "Gửi lại mã OTP",
        redirect: "/",
        usePasswordReset: false,
        icon: <Mail className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />,
      };
  }
}

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const emailParam = searchParams.get("email");
  const identifierParam = searchParams.get("identifier");

  const { user, fetchUser } = useAuth();
  const {
    verifyTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    resendOtp,
    verifyEmailOtp,
  } = useTwoFactor();
  const { verifyPasswordResetOtp, resendPasswordResetOtp } = usePasswordReset();

  const config = getOtpConfig(mode);
  const emailToUse = user?.email || emailParam || "";
  const usernameToUse = user?.username || identifierParam || "";
  const maskedEmail = maskEmail(emailToUse);

  // States
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Callbacks
  const startResendCooldown = useCallback(() => {
    setResendDisabled(true);
    setCountdown(RESEND_COOLDOWN_SECONDS);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Effects
  useEffect(() => {
    const intervalRef = countdownIntervalRef.current;
    return () => {
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    };
  }, []);

  useEffect(() => {
    // Validate required parameters
    const requiresEmail = mode !== "login-2fa";
    if (requiresEmail && !emailToUse) {
      toast.error("Không tìm thấy thông tin cần thiết để xác thực.");
      router.replace("/login");
      return;
    }

    // Validate email format if provided
    if (requiresEmail && emailToUse && !isValidEmail(emailToUse)) {
      toast.error("Định dạng email không hợp lệ.");
      router.replace("/login");
    }
  }, [emailToUse, mode, router]);

  // Handlers
  const handleComplete = async (code: string) => {
    if (!emailToUse && mode !== "login-2fa") {
      toast.error("Thiếu thông tin email/identifier.");
      return;
    }

    setIsVerifying(true);

    try {
      // 1. Quên mật khẩu (OTP reset password)
      if (mode === "forgot-password") {
        const response = await verifyPasswordResetOtp(emailToUse, code);
        toast.success(config.successMsg);
        router.push(
          `${config.redirect}?email=${encodeURIComponent(
            emailToUse
          )}&resetToken=${response.resetToken}`
        );
        return;
      }

      // 2. Xác thực email
      if (mode === "verify-email") {
        await verifyEmailOtp(emailToUse, code);
        toast.success(config.successMsg);
        router.push(config.redirect);
        return;
      }

      // 3. Login 2FA: cần challengeToken tạm từ sessionStorage
      if (mode === "login-2fa") {
        const challengeToken = sessionStorage.getItem("challengeToken");
        if (!challengeToken) {
          toast.error("Session hết hạn. Vui lòng đăng nhập lại.");
          router.push("/login");
          return;
        }
        console.log(
          `Verifying 2FA for user: ${usernameToUse}, code: ${code}, challengeToken: ${challengeToken}`
        );
        await verifyTwoFactor(usernameToUse, code, challengeToken);
        await fetchUser();
        sessionStorage.removeItem("challengeToken");
        toast.success(config.successMsg);
        router.push(config.redirect);
        return;
      }

      // 4. Bật 2FA
      if (mode === "enable-2fa") {
        // enableTwoFactor({ username, otp })
        await enableTwoFactor({ username: usernameToUse, otp: code });
        toast.success(config.successMsg);
        router.push(config.redirect);
        return;
      }

      // 5. Tắt 2FA
      if (mode === "disable-2fa") {
        // disableTwoFactor({ username, otp })
        await disableTwoFactor({ username: usernameToUse, otp: code });
        toast.success(config.successMsg);
        router.push(config.redirect);
        return;
      }

      // Nếu mode không khớp, báo lỗi
      toast.error("Không xác định được loại xác thực OTP.");
    } catch (err: unknown) {
      const errorMessage = parseError(err);
      toast.error(errorMessage || DEFAULT_ERROR_MSG);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!emailToUse && mode !== "login-2fa") {
      toast.error("Thiếu thông tin email/identifier để gửi lại mã.");
      return;
    }

    setIsResending(true);

    try {
      if (mode === "forgot-password") {
        await resendPasswordResetOtp(emailToUse);
      } else if (mode === "verify-email") {
        await resendOtp(emailToUse, config.otpType);
      } else {
        // 2FA modes
        await resendOtp(usernameToUse, config.otpType);
      }

      toast.success("Mã OTP mới đã được gửi thành công!");
      startResendCooldown();
    } catch (err: unknown) {
      const errorMessage = parseError(err);
      toast.error(errorMessage || RESEND_ERROR_MSG);
    } finally {
      setIsResending(false);
    }
  };

  // Loading state
  if (!emailToUse && mode !== "login-2fa") {
    return (
      <div className="flex min-h-[95vh] items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Đang tải thông tin...
          </p>
        </div>
      </div>
    );
  }

  // Progress bar percentage
  const progressPercentage =
    resendDisabled && countdown > 0
      ? ((RESEND_COOLDOWN_SECONDS - countdown) / RESEND_COOLDOWN_SECONDS) * 100
      : 0;

  return (
    <div className="flex min-h-[95vh] items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-700 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="relative bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-gray-800 dark:text-gray-100 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-indigo-400 blur-2xl opacity-30 dark:bg-indigo-800 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-purple-400 blur-2xl opacity-30 dark:bg-purple-800 pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/80 shadow-lg mb-4">
              {config.icon}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">
              {config.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              {config.description}{" "}
              {maskedEmail && maskedEmail !== "địa chỉ email của bạn" && (
                <>
                  Chúng tôi đã gửi đến{" "}
                  <strong className="font-medium text-gray-700 dark:text-gray-200 break-all">
                    {maskedEmail}
                  </strong>
                  .
                </>
              )}
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex flex-col items-center">
            <OTPInput
              length={OTP_LENGTH}
              onComplete={handleComplete}
              disabled={isVerifying}
            />
          </div>

          {/* Progress bar for cooldown */}
          {resendDisabled && countdown > 0 && (
            <div className="w-full pt-2">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Resend button */}
          <div className="text-center pt-2">
            <Button
              variant="link"
              className={cn(
                "text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors",
                isResending && !resendDisabled && "cursor-wait"
              )}
              onClick={handleResend}
              disabled={resendDisabled || isResending}
              type="button"
            >
              {isResending && !resendDisabled && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {resendDisabled && countdown > 0
                ? `Gửi lại sau ${countdown} giây`
                : config.resendActionName}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

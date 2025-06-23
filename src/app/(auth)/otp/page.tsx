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
import { useOtp } from "@/hooks/useOtp";
import { OtpType } from "@/types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Constants
const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;
const DEFAULT_ERROR_MSG =
  "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.";

// Helper functions
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const maskIdentifier = (identifier: string): string => {
  if (!identifier) return "thông tin của bạn";
  if (isValidEmail(identifier)) {
    return identifier.replace(/(?<=.).(?=.*@)/g, "*");
  }
  // Giả sử nếu không phải email thì là username
  if (identifier.length > 3) {
    return (
      identifier.substring(0, 2) +
      "*".repeat(identifier.length - 3) +
      identifier.slice(-1)
    );
  }
  return identifier;
};
const parseError = (err: unknown): string => {
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    try {
      const errorData = JSON.parse(err.message);
      return errorData.message || err.message;
    } catch {
      return err.message;
    }
  }
  return "Đã xảy ra lỗi không xác định.";
};

// Config cho từng loại OTP
interface OtpConfig {
  otpType: OtpType;
  title: string;
  description: string;
  successMsg: string;
  resendActionName: string;
  redirect: string;
  icon: React.ReactNode;
}

function getOtpConfig(mode: string | null): OtpConfig {
  switch (mode) {
    case "verify-email":
      return {
        otpType: OtpType.EMAIL_VERIFICATION,
        title: "Xác thực Email",
        description: `Nhập mã OTP gồm ${OTP_LENGTH} chữ số đã được gửi tới email của bạn.`,
        successMsg: "Xác thực email thành công!",
        resendActionName: "Gửi lại mã",
        redirect: "/login",
        icon: <UserCheck className="h-8 w-8 text-green-500" />,
      };
    case "enable-2fa":
      return {
        otpType: OtpType.ENABLE_2FA_VERIFICATION,
        title: "Kích hoạt 2FA",
        description: `Nhập mã OTP từ ứng dụng xác thực của bạn để bật 2FA.`,
        successMsg: "Xác thực 2 yếu tố đã được kích hoạt!",
        resendActionName: "Gửi lại mã",
        redirect: "/settings/security",
        icon: <ShieldCheck className="h-8 w-8 text-indigo-500" />,
      };
    case "disable-2fa":
      return {
        otpType: OtpType.DISABLE_2FA_VERIFICATION,
        title: "Hủy 2FA",
        description: `Nhập mã OTP để xác nhận hủy bỏ 2FA.`,
        successMsg: "Xác thực 2 yếu tố đã được hủy bỏ!",
        resendActionName: "Gửi lại mã",
        redirect: "/settings/security",
        icon: <UserX className="h-8 w-8 text-red-500" />,
      };
    case "login-2fa":
      return {
        otpType: OtpType.TWO_FACTOR_AUTH_LOGIN,
        title: "Xác thực Đăng nhập",
        description: "Nhập mã OTP từ ứng dụng xác thực để hoàn tất đăng nhập.",
        successMsg: "Xác thực thành công! Đang chuyển hướng...",
        resendActionName: "Gửi lại mã",
        redirect: "/",
        icon: <LogIn className="h-8 w-8 text-indigo-500" />,
      };
    case "forgot-password":
      return {
        otpType: OtpType.PASSWORD_RESET,
        title: "Đặt lại Mật khẩu",
        description: "Nhập mã OTP đã gửi tới email của bạn để tiếp tục.",
        successMsg: "Xác thực thành công!",
        resendActionName: "Gửi lại mã",
        redirect: "/reset-password",
        icon: <KeyRound className="h-8 w-8 text-orange-500" />,
      };
    default:
      return {
        otpType: OtpType.EMAIL_VERIFICATION,
        title: "Xác thực OTP",
        description: `Nhập mã OTP gồm ${OTP_LENGTH} chữ số.`,
        successMsg: "Xác thực thành công!",
        resendActionName: "Gửi lại mã",
        redirect: "/",
        icon: <Mail className="h-8 w-8 text-indigo-500" />,
      };
  }
}

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const identifier = searchParams.get("identifier");
  const challengeToken = searchParams.get("challengeToken");

  const { fetchUser } = useAuth();
  const { verifyOtp, resendOtp } = useOtp();

  const config = getOtpConfig(mode);
  const maskedIdentifier = maskIdentifier(identifier || "");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startResendCooldown = useCallback(() => {
    setResendDisabled(true);
    setCountdown(RESEND_COOLDOWN_SECONDS);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!identifier) {
      toast.error("Thiếu thông tin xác thực.", {
        description: "Vui lòng thử lại từ đầu.",
      });
      router.replace("/login");
    }
  }, [identifier, router]);

  const handleComplete = async (otp: string) => {
    if (!identifier) return;

    setIsVerifying(true);
    try {
      // Sử dụng switch để giúp TypeScript hiểu rõ ngữ cảnh
      switch (config.otpType) {
        case OtpType.PASSWORD_RESET: {
          const result = await verifyOtp({
            identifier,
            otp,
            otpType: OtpType.PASSWORD_RESET,
          });
          toast.success(config.successMsg);
          router.push(
            `${config.redirect}?identifier=${encodeURIComponent(
              identifier
            )}&resetToken=${result.resetToken}`
          );
          break;
        }

        case OtpType.TWO_FACTOR_AUTH_LOGIN: {
          if (!challengeToken) {
            throw new Error("Challenge token is missing for 2FA login.");
          }
          await verifyOtp({
            identifier,
            otp,
            otpType: OtpType.TWO_FACTOR_AUTH_LOGIN,
            challengeToken,
          });
          await fetchUser();
          toast.success(config.successMsg);
          router.push(config.redirect);
          break;
        }

        case OtpType.EMAIL_VERIFICATION:
        case OtpType.ENABLE_2FA_VERIFICATION:
        case OtpType.DISABLE_2FA_VERIFICATION: {
          await verifyOtp({
            identifier,
            otp,
            otpType: config.otpType, // An toàn khi dùng trong case này
          });
          toast.success(config.successMsg);
          router.push(config.redirect);
          break;
        }

        default:
          throw new Error("Unsupported OTP type.");
      }
    } catch (err: unknown) {
      toast.error("Xác thực thất bại", {
        description: parseError(err) || DEFAULT_ERROR_MSG,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!identifier) return;

    setIsResending(true);
    try {
      await resendOtp({
        identifier,
        otpType: config.otpType,
        challengeToken: challengeToken || undefined,
      });
      toast.success("Mã OTP mới đã được gửi thành công!");
      startResendCooldown();
    } catch (err) {
      toast.error("Gửi lại thất bại", {
        description: parseError(err) || "Không thể gửi lại mã OTP.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!identifier) {
    return (
      <div className="flex min-h-[95vh] items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = resendDisabled
    ? ((RESEND_COOLDOWN_SECONDS - countdown) / RESEND_COOLDOWN_SECONDS) * 100
    : 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
              {config.icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {config.title}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
              {config.description} Chúng tôi đã gửi mã đến{" "}
              <strong className="font-semibold text-gray-800 dark:text-gray-200">
                {maskedIdentifier}
              </strong>
              .
            </p>
          </div>

          <div className="flex flex-col items-center">
            <OTPInput
              length={OTP_LENGTH}
              onComplete={handleComplete}
              disabled={isVerifying}
            />
          </div>

          {resendDisabled && (
            <div className="w-full pt-2">
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <Button
              variant="link"
              className={cn(
                "text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:text-gray-400 dark:disabled:text-gray-500",
                isResending && "cursor-wait"
              )}
              onClick={handleResend}
              disabled={resendDisabled || isResending}
              type="button"
            >
              {isResending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {resendDisabled
                ? `Gửi lại sau ${countdown} giây`
                : config.resendActionName}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

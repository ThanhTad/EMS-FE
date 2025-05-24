// app/(auth)/2fa/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import OTPInput from "@/components/shared/OTPInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { OtpType } from "@/types";
import { motion } from "framer-motion";

export default function TwoFAPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { verifyTwoFactor, resendOtp } = useTwoFactor();

  // Redirect nếu chưa login
  useEffect(() => {
    if (!user) console.error("Chưa đăng nhập");
  }, [user, router]);

  // Resend cooldown
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const initialDelay = useRef(60);

  // Đếm ngược
  useEffect(() => {
    if (countdown <= 0) {
      setResendDisabled(false);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleComplete = async (code: string) => {
    if (!user) throw new Error("Không tìm thấy thông tin user");
    try {
      await verifyTwoFactor(
        user.username,
        code,
        OtpType.ENABLE_2FA_VERIFICATION
      );
      toast.success("Xác thực thành công!");
      router.push("/");
    } catch (err) {
      // rethrow để OTPInput shake
      console.error(err);
      throw new Error("Mã OTP không hợp lệ");
    }
  };

  const handleResend = async () => {
    if (!user) return;
    setResendDisabled(true);
    try {
      const result = await resendOtp(
        user.username,
        OtpType.TWO_FACTOR_AUTH_LOGIN
      );
      toast.success("Mã OTP mới đã được gửi!");
      // parse delay từ message hoặc dùng default
      const m = result?.data?.message?.match(/(\d+)\s*second/);
      const delay = m ? parseInt(m[1], 10) : initialDelay.current;
      initialDelay.current = delay;
      setCountdown(delay);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Gửi lại thất bại");
      } else {
        toast.error("Gửi lại thất bại");
      }
      const m = err instanceof Error && err.message.match(/(\d+)\s*second/);
      if (m) setCountdown(parseInt(m[1], 10));
      else setResendDisabled(false);
    }
  };

  // Mask email
  const maskedEmail = user?.email
    ? user.email.replace(
        /^(.{2})(.*)(@.*)$/,
        (_, a, b, c) => a + "*".repeat(b.length) + c
      )
    : "";

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-700  px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="relative bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-8 space-y-7 text-gray-900 dark:text-gray-100 overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-indigo-400 blur-2xl opacity-40 dark:bg-indigo-800 pointer-events-none" />
          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 shadow mb-2">
              <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
            </span>
            <h1 className="text-2xl font-semibold dark:text-white">
              Xác thực 2FA
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Nhập mã gồm 6 chữ số đã gửi đến{" "}
              <strong className="text-gray-900 dark:text-gray-100 break-all">
                {maskedEmail}
              </strong>
            </p>
          </div>

          <div className="flex flex-col items-center">
            <OTPInput length={6} onComplete={handleComplete} />
          </div>

          {/* Progress bar khi resend disabled */}
          {resendDisabled && (
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mt-2">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${
                    ((initialDelay.current - countdown) /
                      initialDelay.current) *
                    100
                  }%`,
                }}
              />
            </div>
          )}

          <div className="text-center mt-4">
            <button
              className="text-sm underline text-primary dark:text-primary disabled:text-gray-400 dark:disabled:text-gray-600 focus:outline-none"
              onClick={handleResend}
              disabled={resendDisabled}
              type="button"
            >
              {resendDisabled
                ? `Gửi lại sau ${countdown}s`
                : "Chưa nhận được mã? Gửi lại OTP"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

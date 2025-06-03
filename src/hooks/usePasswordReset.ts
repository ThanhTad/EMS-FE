// custom hook cho flow Quên / Đặt lại mật khẩu
import {
  requestPasswordResetAPI,
  verifyPasswordResetOtpAPI,
  resetPasswordAPI,
  resendOtpAPI,
} from "@/lib/api";
import { OtpType } from "@/types";

export function usePasswordReset() {
  // Bước 1: Gửi yêu cầu reset password (OTP sẽ được gửi qua email)
  const requestPasswordReset = (email: string) =>
    requestPasswordResetAPI({ email });

  // Bước 2: Verify OTP và nhận reset token
  const verifyPasswordResetOtp = (identifier: string, otp: string) =>
    verifyPasswordResetOtpAPI({
      identifier,
      otp,
      otpType: OtpType.PASSWORD_RESET,
    });

  // Bước 3: Reset password với reset token
  const resetPassword = (data: {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
  }) => resetPasswordAPI(data);

  // Resend OTP cho password reset
  const resendPasswordResetOtp = (identifier: string) =>
    resendOtpAPI({
      identifier,
      otpType: OtpType.PASSWORD_RESET,
    });

  return {
    requestPasswordReset,
    verifyPasswordResetOtp,
    resendPasswordResetOtp,
    resetPassword,
  };
}

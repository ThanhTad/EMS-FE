// custom hook cho flow Quên / Đặt lại mật khẩu
import { requestPasswordResetAPI, resetPasswordAPI } from "@/lib/api";

export function usePasswordReset() {
  const requestPasswordReset = (email: string) =>
    requestPasswordResetAPI({ email });

  const resetPassword = (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => resetPasswordAPI(data);

  return { requestPasswordReset, resetPassword };
}

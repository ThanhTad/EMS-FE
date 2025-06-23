// hooks/useOtp.ts
import {
  Enable2FARequest,
  Disable2FARequest,
  SentOtpRequest,
  ResendOtpRequest,
  VerifyOtpRequest,
  AuthResponse,
  ResetPasswordVerificationResponse,
  OtpType,
  RequestPasswordResetRequest,
  ResetPasswordWithTokenRequest,
} from "@/types";
import {
  enable2FAAPI,
  disable2FAAPI,
  sendOtpToEnable2FAAPI,
  verify2FAAPI,
  verifyPasswordResetOtpAPI,
  verifyEmailOtpAPI,
  resendOtpAPI,
  requestPasswordResetAPI,
  resetPasswordAPI,
} from "@/lib/api";

// SỬ DỤNG FUNCTION OVERLOADS ĐỂ GỘP CÁC HÀM `verify` LẠI MÀ VẪN TYPE-SAFE
// Overload 1: Cho flow đăng nhập 2FA, trả về AuthResponse
function verifyOtp(
  request: VerifyOtpRequest & { otpType: OtpType.TWO_FACTOR_AUTH_LOGIN }
): Promise<AuthResponse>;

// Overload 2: Cho flow reset mật khẩu, trả về thông tin token
function verifyOtp(
  request: VerifyOtpRequest & { otpType: OtpType.PASSWORD_RESET }
): Promise<ResetPasswordVerificationResponse>;

// Overload 3: Cho các flow chỉ cần xác nhận thành công, trả về void
function verifyOtp(
  request: VerifyOtpRequest & {
    otpType:
      | OtpType.EMAIL_VERIFICATION
      | OtpType.ENABLE_2FA_VERIFICATION
      | OtpType.DISABLE_2FA_VERIFICATION;
  }
): Promise<void>;

// Function triển khai thực tế
async function verifyOtp(
  request: VerifyOtpRequest
): Promise<AuthResponse | ResetPasswordVerificationResponse | void> {
  // Hàm này sẽ gọi API tương ứng dựa trên otpType
  switch (request.otpType) {
    case OtpType.TWO_FACTOR_AUTH_LOGIN:
      return verify2FAAPI(request);
    case OtpType.PASSWORD_RESET:
      return verifyPasswordResetOtpAPI(request);
    case OtpType.EMAIL_VERIFICATION:
      await verifyEmailOtpAPI(request);
      return;
    // Cần đảm bảo các hàm API cho enable/disable 2FA cũng nhận payload tương tự
    // hoặc điều chỉnh payload ở đây cho phù hợp.
    case OtpType.ENABLE_2FA_VERIFICATION:
      await enable2FAAPI({ username: request.identifier!, otp: request.otp });
      return;
    case OtpType.DISABLE_2FA_VERIFICATION:
      await disable2FAAPI({ username: request.identifier!, otp: request.otp });
      return;
    default:
      // Xử lý type-safe cho các trường hợp không lường trước
      const exhaustiveCheck: never = request.otpType;
      return Promise.reject(new Error(`Invalid OTP type: ${exhaustiveCheck}`));
  }
}

export function useOtp() {
  // Các hàm gửi OTP ban đầu (không thuộc trang OTP)
  const requestPasswordReset = (data: RequestPasswordResetRequest) =>
    requestPasswordResetAPI(data);
  const resetPassword = (data: ResetPasswordWithTokenRequest) =>
    resetPasswordAPI(data);
  const sendOtpToEnable2FA = (data: SentOtpRequest) =>
    sendOtpToEnable2FAAPI(data);

  // Các hàm này có thể được gọi từ trang settings, giữ lại để rõ ràng
  const enableTwoFactor = (data: Enable2FARequest) => enable2FAAPI(data);
  const disableTwoFactor = (data: Disable2FARequest) => disable2FAAPI(data);

  // Hàm resend OTP tổng quát, dùng trong trang OTP
  const resendOtp = (data: ResendOtpRequest) => resendOtpAPI(data);

  return {
    // Các hàm cho các flow khác
    requestPasswordReset,
    resetPassword,
    sendOtpToEnable2FA,
    enableTwoFactor,
    disableTwoFactor,

    // Các hàm chính dùng trong trang OTP
    resendOtp,
    verifyOtp,
  };
}

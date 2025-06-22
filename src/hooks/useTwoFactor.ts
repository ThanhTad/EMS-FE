import {
  // Types cho request
  Enable2FARequest,
  Disable2FARequest,
  SentOtpRequest,
  ResendOtpRequest,
  VerifyOtpRequest,

  // Types cho response
  AuthResponse,
  ResetPasswordVerificationResponse,

  // Enum
  OtpType,
} from "@/types";
import {
  // Các hàm API tương ứng
  enable2FAAPI,
  disable2FAAPI,
  sendOtpToDisable2FAAPI,
  verify2FAAPI,
  verifyPasswordResetOtpAPI,
  verifyEmailOtpAPI,
  resendOtpAPI,
  sendOtpToEnable2FAAPI,
} from "@/lib/api";

// SỬ DỤNG FUNCTION OVERLOADS ĐỂ GỘP 3 HÀM `verify` LẠI MÀ VẪN TYPE-SAFE
// Overload 1: Cho flow đăng nhập 2FA
function verifyOtp(
  request: VerifyOtpRequest & { otpType: OtpType.TWO_FACTOR_AUTH_LOGIN }
): Promise<AuthResponse>;

// Overload 2: Cho flow reset mật khẩu
function verifyOtp(
  request: VerifyOtpRequest & { otpType: OtpType.PASSWORD_RESET }
): Promise<ResetPasswordVerificationResponse>;

// Overload 3: Cho flow xác thực email
function verifyOtp(
  request: VerifyOtpRequest & { otpType: OtpType.EMAIL_VERIFICATION }
): Promise<void>;

// Function triển khai thực tế
function verifyOtp(
  request: VerifyOtpRequest
): Promise<AuthResponse | ResetPasswordVerificationResponse | void> {
  switch (request.otpType) {
    case OtpType.TWO_FACTOR_AUTH_LOGIN:
      return verify2FAAPI(request);

    case OtpType.PASSWORD_RESET:
      return verifyPasswordResetOtpAPI(request);

    case OtpType.EMAIL_VERIFICATION:
      // Giả sử verifyEmailOtpAPI trả về Promise<void> sau khi unwrap
      return verifyEmailOtpAPI(request).then(() => {});

    default:
      // Xử lý trường hợp không mong muốn
      return Promise.reject(new Error("Invalid OTP type provided."));
  }
}

export function useTwoFactor() {
  // Các hàm này đã tốt, giữ nguyên vì chúng có mục đích rõ ràng
  const sendOtpToEnable2FA = (request: SentOtpRequest) =>
    sendOtpToEnable2FAAPI(request);

  const enableTwoFactor = (request: Enable2FARequest) => enable2FAAPI(request);

  const sendOtpToDisable2FA = (request: SentOtpRequest) =>
    sendOtpToDisable2FAAPI(request);

  const disableTwoFactor = (request: Disable2FARequest) =>
    disable2FAAPI(request);

  // Cải thiện: Nhận một object duy nhất để nhất quán
  const resendOtp = (request: ResendOtpRequest) => resendOtpAPI(request);

  return {
    sendOtpToEnable2FA,
    enableTwoFactor,
    sendOtpToDisable2FA,
    disableTwoFactor,

    // Hàm mới, gộp lại và type-safe hơn
    verifyOtp,

    // Hàm này cũng được cải thiện để nhất quán hơn
    resendOtp,
  };
}

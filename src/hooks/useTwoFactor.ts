// custom hook cho flow 2FA
import {
  OtpType,
  ApiResponse,
  ResetPasswordVerificationResponse,
  SentOtpRequest,
  AuthResponse,
  Enable2FARequest,
  Disable2FARequest,
} from "@/types";
import {
  enable2FAAPI,
  disable2FAAPI,
  sendOtpToDisable2FAAPI,
  verify2FAAPI,
  verifyPasswordResetOtpAPI,
  verifyEmailOtpAPI,
  resendOtpAPI,
  sendOtpToEnable2FAAPI,
} from "@/lib/api";

export function useTwoFactor() {
  // Gửi OTP để bật 2FA (cần thêm endpoint này)
  const sendOtpToEnable2FA = (request: SentOtpRequest) =>
    sendOtpToEnable2FAAPI(request);

  // Bật 2FA (gửi OTP enable)
  const enableTwoFactor = (request: Enable2FARequest) => enable2FAAPI(request);

  // Gửi OTP để tắt 2FA
  const sendOtpToDisable2FA = (request: SentOtpRequest) =>
    sendOtpToDisable2FAAPI(request);

  // Tắt 2FA (xác thực OTP disable)
  const disableTwoFactor = (request: Disable2FARequest) =>
    disable2FAAPI(request);

  // Xác thực 2FA OTP sau khi login thành công (cần Authorization header)
  const verifyTwoFactor = (
    identifier: string,
    otp: string,
    challengeToken: string // temp token từ login response
  ): Promise<ApiResponse<AuthResponse>> =>
    verify2FAAPI({
      identifier,
      otp,
      otpType: OtpType.TWO_FACTOR_AUTH_LOGIN,
      challengeToken,
    });

  // Xác thực OTP reset password
  const verifyPasswordResetOtp = (
    identifier: string,
    otp: string
  ): Promise<ResetPasswordVerificationResponse> =>
    verifyPasswordResetOtpAPI({
      identifier,
      otp,
      otpType: OtpType.PASSWORD_RESET,
    });

  // Xác thực OTP verify email
  const verifyEmailOtp = (
    identifier: string,
    otp: string
  ): Promise<ApiResponse<void>> =>
    verifyEmailOtpAPI({
      identifier,
      otp,
      otpType: OtpType.EMAIL_VERIFICATION,
    });

  // Gửi lại OTP cho mọi flow
  const resendOtp = (
    identifier: string,   
    otpType: OtpType,
    challengeToken?: string
  ) => resendOtpAPI({ identifier, otpType, challengeToken });

  return {
    sendOtpToEnable2FA,
    enableTwoFactor,
    disableTwoFactor,
    sendOtpToDisable2FA,
    verifyTwoFactor, // cho 2FA login
    verifyPasswordResetOtp, // cho reset password
    verifyEmailOtp, // cho verify email
    resendOtp,
  };
}

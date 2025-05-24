// custom hook cho flow 2FA
import { OtpType, ApiResponse, AuthResponse } from "@/types";
import {
  enable2FAAPI,
  disable2FAAPI,
  sendOtpToDisable2FAAPI,
  verify2FAAPI,
  resendOtpAPI,
} from "@/lib/api";

export function useTwoFactor() {
  const enableTwoFactor = (request: { identifier: string }) =>
    enable2FAAPI(request);

  const sendOtpToDisable2FA = (request: {
    identifier: string;
    otpType: OtpType;
  }) => sendOtpToDisable2FAAPI(request);

  const disableTwoFactor = (request: { identifier: string; otp: string }) =>
    disable2FAAPI(request);

  const verifyTwoFactor = (
    identifier: string,
    otp: string,
    otpType: OtpType.ENABLE_2FA_VERIFICATION
  ): Promise<ApiResponse<AuthResponse>> =>
    verify2FAAPI({ identifier, otp, otpType });

  const resendOtp = (identifier: string, otpType: OtpType) =>
    resendOtpAPI({ identifier, otpType });

  return {
    enableTwoFactor,
    disableTwoFactor,
    sendOtpToDisable2FA,
    verifyTwoFactor,
    resendOtp,
  };
}

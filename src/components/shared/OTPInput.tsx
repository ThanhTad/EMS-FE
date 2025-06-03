// components/shared/OTPInput.tsx
"use client";

import {
  useState,
  useRef,
  useCallback,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => Promise<void>;
  disabled?: boolean;
}

const INPUT_BASE_CLASSES =
  "aspect-square w-12 h-12 sm:w-14 sm:h-14 text-center rounded-lg text-2xl font-medium transition-all duration-200 ease-in-out shadow-sm";
const INPUT_IDLE_CLASSES =
  "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 dark:focus:border-indigo-500";
const INPUT_SUCCESS_CLASSES =
  "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500 dark:border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-500/50";
const INPUT_ERROR_CLASSES =
  "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-500 dark:border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/50 animate-shake-short";

export default function OTPInput({
  length = 6,
  onComplete,
  disabled = false,
}: OTPInputProps) {
  const [otpValues, setOtpValues] = useState<string[]>(() =>
    Array(length).fill("")
  );
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const submittingRef = useRef(false); // Flag ngăn submit trùng

  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus();
        inputRefs.current[index]?.select();
      }
    },
    [length]
  );

  const handleComplete = async (code: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      await onComplete(code);
      setStatus("success");
    } catch {
      setStatus("error");
      setTimeout(() => {
        setOtpValues(Array(length).fill(""));
        setStatus("idle");
        focusInput(0);
      }, 1200);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const trySubmitIfComplete = (values: string[]) => {
    if (values.every((v) => v !== "")) {
      const code = values.join("");
      handleComplete(code);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (disabled || isSubmitting) return;

    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    setStatus("idle");

    if (value && index < length - 1) {
      focusInput(index + 1);
    }

    trySubmitIfComplete(newOtpValues);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (disabled || isSubmitting) return;

    if (e.key === "Backspace") {
      if (otpValues[index]) {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = "";
        setOtpValues(newOtpValues);
      } else if (index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled || isSubmitting) return;
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text/plain")
      .trim()
      .replace(/[^0-9]/g, "")
      .slice(0, length);

    if (pastedData.length > 0) {
      const newOtpValues = Array(length).fill("");
      for (let i = 0; i < pastedData.length; i++) {
        newOtpValues[i] = pastedData[i];
      }
      setOtpValues(newOtpValues);
      setStatus("idle");

      const focusNext = Math.min(pastedData.length, length - 1);
      focusInput(focusNext);
      trySubmitIfComplete(newOtpValues); // Chỉ gọi một lần
    }
  };

  return (
    <div className="flex flex-col items-center gap-4" aria-label="Mã OTP">
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={1}
            value={otpValues[index]}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled || isSubmitting}
            aria-label={`Ký tự OTP thứ ${index + 1}`}
            className={cn(
              INPUT_BASE_CLASSES,
              (disabled || isSubmitting) &&
                "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700",
              !disabled && status === "idle" && INPUT_IDLE_CLASSES,
              !disabled && status === "success" && INPUT_SUCCESS_CLASSES,
              !disabled && status === "error" && INPUT_ERROR_CLASSES
            )}
          />
        ))}
      </div>

      {isSubmitting && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Đang xác minh mã...
        </div>
      )}
    </div>
  );
}

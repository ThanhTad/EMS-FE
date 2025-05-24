// components/shared/OTPInput.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => Promise<void>;
}

export default function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(() => Array(length).fill(""));
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focus = useCallback((i: number) => {
    refs.current[i]?.focus();
    refs.current[i]?.select();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const v = e.target.value;
    if (!/^\d?$/.test(v)) return;
    const arr = [...values];
    arr[i] = v;
    setValues(arr);
    if (v && i < length - 1) focus(i + 1);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace" && !values[i] && i > 0) focus(i - 1);
  };

  useEffect(() => {
    if (values.every((v) => v !== "")) {
      const code = values.join("");
      onComplete(code)
        .then(() => setStatus("success"))
        .catch(() => {
          setStatus("error");
          setTimeout(() => {
            setValues(Array(length).fill(""));
            setStatus("idle");
            focus(0);
          }, 500);
        });
    }
  }, [focus, length, onComplete, values]);

  return (
    <div className="flex justify-center gap-2">
      {values.map((v, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={clsx(
            "w-14 h-14 text-center rounded-lg text-2xl transition focus:ring-2 focus:ring-primary dark:focus:ring-primary",
            status === "idle" &&
              "border-2 border-gray-300 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white",
            status === "success" &&
              "border-2 border-green-500 bg-white text-gray-800 dark:border-green-400 dark:bg-gray-800 dark:text-green-400",
            status === "error" &&
              "border-2 border-red-500 bg-white text-gray-800 animate-shake dark:border-red-400 dark:bg-gray-800 dark:text-red-400"
          )}
        />
      ))}
    </div>
  );
}

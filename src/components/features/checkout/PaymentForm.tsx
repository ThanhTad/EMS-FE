// components/checkout/PaymentForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "./CountdownTimer";
import { Loader2 } from "lucide-react";
import { HoldDetailsResponseDTO } from "@/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PaymentMethod = "MOMO" | "VNPAY";

interface PaymentFormProps {
  holdDetails: HoldDetailsResponseDTO;
  onFinalizeRedirect: (method: PaymentMethod) => void; // Hàm xử lý cho MoMo/VNPAY
  onFinalizeMock: () => void; // Hàm xử lý cho Mock
  onExpire: () => void;
  isLoading: boolean;
}

export function PaymentForm({
  holdDetails,
  onFinalizeRedirect,
  onFinalizeMock,
  onExpire,
  isLoading,
}: PaymentFormProps) {
  const { expiresAt } = holdDetails;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("MOMO");

  const handlePayment = () => {
    onFinalizeRedirect(selectedMethod);
  };

  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">Thanh toán</h2>
        </div>
        <div className="text-center shrink-0">
          <p className="text-xs font-medium text-gray-500">Thời gian giữ vé</p>
          <CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold">
            Chọn phương thức thanh toán
          </Label>
          <RadioGroup
            value={selectedMethod}
            onValueChange={(value: PaymentMethod) => setSelectedMethod(value)}
            className="mt-3 space-y-3"
          >
            <Label
              htmlFor="momo"
              className="flex items-center space-x-3 border p-4 rounded-md cursor-pointer has-[:checked]:border-purple-500"
            >
              <RadioGroupItem value="MOMO" id="momo" />
              <span>Ví điện tử Momo</span>
            </Label>
            <Label
              htmlFor="vnpay"
              className="flex items-center space-x-3 border p-4 rounded-md cursor-pointer has-[:checked]:border-sky-500"
            >
              <RadioGroupItem value="VNPAY" id="vnpay" />
              <span>Cổng thanh toán VNPAY</span>
            </Label>
          </RadioGroup>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            `Thanh toán qua ${selectedMethod}`
          )}
        </Button>

        {/* Nút Mock chỉ hiển thị ở môi trường development */}
        {process.env.NODE_ENV === "development" && (
          <>
            <div className="my-2 text-center text-xs text-gray-400">
              -- For Testing Only --
            </div>
            <Button
              variant="secondary"
              onClick={onFinalizeMock}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Bỏ qua thanh toán (Test)"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

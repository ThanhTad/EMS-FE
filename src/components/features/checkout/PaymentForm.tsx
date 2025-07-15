// components/checkout/PaymentForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { CountdownTimer } from "./CountdownTimer";
import { Loader2 } from "lucide-react";
import { PaymentDetails } from "@/types";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

interface PaymentFormProps {
  holdId: string;
  expiresAt: string;
  onFinalize: (paymentDetails: PaymentDetails) => void;
  onExpire: () => void;
  isLoading: boolean;
}

export function PaymentForm({
  holdId,
  expiresAt,
  onFinalize,
  onExpire,
  isLoading,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("STRIPE_CARD");
  // Đây là phần giả lập việc lấy paymentToken.
  // Thực tế, bạn sẽ dùng SDK của Stripe, etc. để render form thẻ
  // và lấy token một cách an toàn.
  const handlePayment = async () => {
    // Giả lập việc lấy paymentToken nếu cần
    // Với một số phương thức như Chuyển khoản, có thể không có token
    let paymentToken: string | undefined = undefined;

    if (selectedMethod === "STRIPE_CARD") {
      // Thực tế: gọi stripe.createToken()
      paymentToken = `tok_${holdId}_${Date.now()}`;
    }

    // Gọi hàm onFinalize với DTO hoàn chỉnh
    onFinalize({
      paymentMethod: selectedMethod,
      paymentToken: paymentToken,
    });
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Thanh toán</h2>
        <div className="text-center">
          <p className="text-sm text-gray-500">Thời gian giữ chỗ</p>
          <CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <Label className="font-semibold">Chọn phương thức thanh toán</Label>
          <RadioGroup
            defaultValue={selectedMethod}
            onValueChange={setSelectedMethod}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroup value="STRIPE_CARD" id="card" />
              <Label htmlFor="card">Thẻ Tín dụng / Ghi nợ</Label>
            </div>
            {/* Đây là nơi tích hợp form của Stripe */}
            {selectedMethod === "STRIPE_CARD" && (
              <div className="pl-8 text-sm text-gray-600">
                <div className="border p-4 rounded-md bg-gray-50">
                  <p>Form nhập thông tin thẻ của Stripe sẽ hiện ở đây.</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroup value="MOMO" id="momo" />
              <Label htmlFor="momo">Ví điện tử Momo</Label>
            </div>
            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroup value="VNPAY" id="vnpay" />
              <Label htmlFor="vnpay">Cổng thanh toán VNPAY</Label>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={handlePayment} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : "Thanh toán ngay"}
        </Button>
      </div>
    </div>
  );
}

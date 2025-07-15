// components/checkout/CartSummary.tsx
"use client";

import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CartSummaryProps {
  onProceed: () => void;
  isLoading: boolean;
}

export function CartSummary({ onProceed, isLoading }: CartSummaryProps) {
  const { items, getTotalPrice, getTotalQuantity } = useCartStore();

  if (items.size === 0) {
    return <p>Giỏ hàng của bạn đang trống.</p>;
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
      {/* Hiển thị chi tiết các item... (tùy chỉnh) */}
      <div className="mt-4 border-t pt-4">
        <p>Tổng số vé: {getTotalQuantity()}</p>
        <p className="text-lg font-bold">
          Tổng cộng: {getTotalPrice().toLocaleString()} VNĐ
        </p>
      </div>
      <Button onClick={onProceed} disabled={isLoading} className="w-full mt-4">
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          "Tiếp tục thanh toán"
        )}
      </Button>
    </div>
  );
}

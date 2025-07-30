// components/checkout/CartSummary.tsx
"use client";

import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

interface CartSummaryProps {
  onProceed: () => void;
  isLoading: boolean;
}

export function CartSummary({ onProceed, isLoading }: CartSummaryProps) {
  // Sử dụng selector để chỉ lấy items từ store
  const items = useCartStore((state) => state.items);

  // Sử dụng useMemo để tối ưu hóa tính toán
  const { totalQuantity, totalPrice, itemsArray } = useMemo(() => {
    const itemsArray = Object.values(items);

    let totalQuantity = 0;
    let totalPrice = 0;

    for (const item of itemsArray) {
      const quantity = item.type === "GA" ? item.quantity : 1;
      totalQuantity += quantity;
      totalPrice += item.ticket.price * quantity;
    }

    return { totalQuantity, totalPrice, itemsArray };
  }, [items]);

  if (itemsArray.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p>Giỏ hàng của bạn đang trống.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

      <div className="space-y-3">
        {itemsArray.map((item) => (
          <div
            key={
              item.type === "GA"
                ? `GA-${item.ticket.id}`
                : `SEATED-${item.seat.seatId}`
            }
            className="flex justify-between items-center"
          >
            <div>
              <span className="font-medium">{item.ticket.name}</span>
              {item.type === "SEATED" && (
                <span className="text-sm text-gray-600 ml-2">
                  (Ghế: {item.seat.rowLabel}-{item.seat.seatNumber})
                </span>
              )}
              {item.type === "GA" && (
                <span className="text-sm text-gray-600 ml-2">
                  (SL: {item.quantity})
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="font-semibold">
                {(
                  item.ticket.price * (item.type === "GA" ? item.quantity : 1)
                ).toLocaleString()}{" "}
                VNĐ
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <span>Tổng số vé:</span>
          <span className="font-semibold">{totalQuantity}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng cộng:</span>
          <span>{totalPrice.toLocaleString()} VNĐ</span>
        </div>
      </div>

      <Button
        onClick={onProceed}
        disabled={isLoading || totalQuantity === 0}
        className="w-full mt-6"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          "Giữ chỗ & Tiếp tục"
        )}
      </Button>
    </div>
  );
}

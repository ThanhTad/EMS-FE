// components/shared/EventInitializer.tsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Event } from "@/types";

/**
 * Component này không render UI.
 * Nhiệm vụ của nó là khởi tạo hoặc cập nhật `event` trong cartStore
 * khi người dùng truy cập một trang chi tiết sự kiện mới.
 */
export function EventInitializer({ event }: { event: Event }) {
  const setEvent = useCartStore((state) => state.setEvent);

  useEffect(() => {
    // Gọi hàm setEvent từ store.
    // Logic kiểm tra và xóa giỏ hàng nếu event thay đổi đã được xử lý bên trong store.
    setEvent(event);
  }, [event, setEvent]); // Chạy lại khi đối tượng event thay đổi

  return null;
}

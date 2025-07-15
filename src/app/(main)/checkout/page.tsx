// app/checkout/page.tsx

import { CheckoutFlow } from "@/components/features/checkout/CheckoutFlow";
import { Metadata } from "next";

// (Tùy chọn) Thêm metadata cho trang để tốt cho SEO và tab trình duyệt
export const metadata: Metadata = {
  title: "Thanh toán | EMS",
  description: "Hoàn tất quá trình thanh toán và nhận vé của bạn.",
};

// 3. Định nghĩa component của trang
export default function CheckoutPage() {
  return (
    // 4. Bọc trong một layout chung nếu cần (e.g., container, padding)
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Thanh toán đơn hàng
      </h1>

      {/* 5. Đặt component CheckoutFlow vào đây */}
      <CheckoutFlow />
    </main>
  );
}

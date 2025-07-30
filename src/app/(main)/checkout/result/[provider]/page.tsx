// app/checkout/result/[provider]/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { verifyPaymentAPI } from "@/lib/api";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";

// Component con để xử lý logic, nằm trong Suspense
function PaymentResultContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Lấy slug từ cartStore để có thể điều hướng về đúng trang sự kiện
  const eventInfo = useCartStore((state) => state.eventInfo);
  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<"VERIFYING" | "SUCCESS" | "FAILED">(
    "VERIFYING"
  );
  const [error, setError] = useState<string | null>(null);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  useEffect(() => {
    const provider = params.provider as "momo" | "vnpay";
    if (
      !provider ||
      (!searchParams.has("vnp_TxnRef") && !searchParams.has("orderId"))
    ) {
      setError(
        "Thông tin trả về từ cổng thanh toán không hợp lệ hoặc đã bị hủy."
      );
      setStatus("FAILED");
      return;
    }

    // Chuyển đổi searchParams thành một object
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const verify = async () => {
      try {
        const response = await verifyPaymentAPI({
          provider,
          params: queryParams,
        });
        setPurchaseId(response.purchaseId);
        setStatus("SUCCESS");
        clearCart();
      } catch (err) {
        if (err instanceof Error) {
          setError(
            err.message ||
              "Xác thực thanh toán thất bại. Chữ ký không hợp lệ hoặc giao dịch đã bị hủy."
          );
          setStatus("FAILED");
        }
      }
    };

    verify();
  }, [clearCart, params, searchParams]);

  // Nút hành động cho trường hợp lỗi
  const renderErrorActions = () => {
    // Ưu tiên quay về trang sự kiện nếu có thông tin
    const retryLink = eventInfo?.slug ? `/events/${eventInfo.slug}` : "/";

    return (
      <div className="mt-4 flex gap-4">
        <Button asChild>
          <Link href={retryLink}>Thử lại</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    );
  };

  if (status === "VERIFYING") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">
          Đang xác thực thanh toán, vui lòng chờ...
        </p>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="max-w-md mx-auto my-12">
        <Alert variant="destructive" className="p-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-xl font-bold">
            Thanh toán thất bại!
          </AlertTitle>
          <AlertDescription className="mt-2">
            {error ||
              "Đã có lỗi xảy ra trong quá trình xử lý. Đơn hàng của bạn chưa được hoàn tất."}
          </AlertDescription>
          {renderErrorActions()}
        </Alert>
      </div>
    );
  }

  // status === "SUCCESS"
  return (
    <div className="max-w-md mx-auto my-12 text-center p-6 border rounded-lg shadow-lg">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold">Thanh toán thành công!</h1>
      <p className="mt-2 text-muted-foreground">
        Cảm ơn bạn đã mua vé. Email xác nhận đã được gửi đến bạn.
      </p>

      {purchaseId && (
        <div className="mt-6">
          <p className="text-sm">Mã đơn hàng của bạn:</p>
          <strong className="font-mono text-lg bg-slate-100 px-3 py-1 rounded-md inline-block mt-1">
            {purchaseId}
          </strong>
        </div>
      )}

      <div className="mt-8 flex gap-4 justify-center">
        <Button asChild>
          <Link href="/my-tickets">Xem vé của tôi</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}

// Component cha để bọc Suspense
export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Đang tải trang kết quả...
          </p>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}

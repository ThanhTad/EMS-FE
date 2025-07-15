// components/checkout/CheckoutFlow.tsx
"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
// SỬ DỤNG CÁC HÀM API MỚI
import { holdTicketsAPI, checkoutAPI, releaseTicketsAPI } from "@/lib/api";
import { createHoldRequestDTOFromCart } from "@/lib/utils";

import { CartSummary } from "./CartSummary";
import { PaymentForm } from "./PaymentForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentDetails } from "@/types";
import { useRouter } from "next/navigation";

type CheckoutStep = "CART" | "PAYMENT" | "CONFIRMATION" | "ERROR";

export function CheckoutFlow() {
  const [step, setStep] = useState<CheckoutStep>("CART");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const router = useRouter();

  const { event, clearCart } = useCartStore((state) => ({
    event: state.event,
    clearCart: state.clearCart,
  }));

  // Hook để tự động release vé khi người dùng rời khỏi trang
  useEffect(() => {
    return () => {
      if (holdId) {
        // Gửi yêu cầu nhả vé mà không cần chờ kết quả
        // Đây là một hành động "dọn dẹp"
        releaseTicketsAPI(holdId).catch((err) =>
          console.error("Failed to auto-release hold:", err)
        );
      }
    };
  }, [holdId]);

  const handleProceedToPayment = async () => {
    if (!event) {
      setError("Không có thông tin sự kiện để tiếp tục.");
      setStep("ERROR");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const requestDTO = createHoldRequestDTOFromCart();
      // GỌI API MỚI: holdTicketsAPI
      const response = await holdTicketsAPI(event.id, requestDTO);

      setHoldId(response.holdId);
      setHoldExpiresAt(response.expiresAt);
      clearCart();
      setStep("PAYMENT");
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message ||
            "Không thể giữ chỗ. Vé có thể đã được bán hết. Vui lòng thử lại."
        );
      }
      setStep("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async (paymentDetails: PaymentDetails) => {
    if (!holdId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Truyền thẳng `paymentDetails` vào API
      const response = await checkoutAPI(holdId, paymentDetails);

      router.push(`/checkout/success?purchaseId=${response.purchaseId}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message ||
            "Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleHoldExpired = () => {
    setError("Phiên giữ chỗ của bạn đã hết hạn. Vui lòng chọn lại vé.");
    setStep("ERROR");
    setHoldId(null); // Xóa holdId đã hết hạn
  };

  const handleRetry = () => {
    setError(null);
    setStep("CART");
  };

  // Render component dựa trên bước hiện tại
  const renderStep = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Đã có lỗi xảy ra</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={handleRetry} className="mt-4">
            Quay lại giỏ hàng
          </Button>
        </Alert>
      );
    }
    // ... phần render các step khác giữ nguyên ...
    switch (step) {
      case "CART":
        return (
          <CartSummary
            onProceed={handleProceedToPayment}
            isLoading={isLoading}
          />
        );
      case "PAYMENT":
        if (holdId && holdExpiresAt) {
          return (
            <PaymentForm
              holdId={holdId}
              expiresAt={holdExpiresAt}
              onFinalize={handleFinalize}
              onExpire={handleHoldExpired}
              isLoading={isLoading}
            />
          );
        }
        return <p>Đang tải...</p>; // Hoặc skeleton
      default:
        return (
          <CartSummary
            onProceed={handleProceedToPayment}
            isLoading={isLoading}
          />
        );
    }
  };

  return <div className="max-w-2xl mx-auto my-8">{renderStep()}</div>;
}

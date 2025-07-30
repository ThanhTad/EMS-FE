// components/checkout/CheckoutFlow.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCartStore } from "@/stores/cartStore";
import {
  holdTicketsAPI,
  getHoldDetailsAPI,
  releaseTicketsBeaconAPI,
  mockFinalizeAPI,
  createPaymentAPI,
} from "@/lib/api";
import { createHoldRequestDTO } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

import { CartSummary } from "./CartSummary";
import { PaymentForm } from "./PaymentForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { HoldDetailsResponseDTO } from "@/types";

// Định nghĩa các bước của quy trình checkout
type CheckoutStep = "LOADING" | "CART_SUMMARY" | "PAYMENT" | "ERROR";

export function CheckoutFlow() {
  const [step, setStep] = useState<CheckoutStep | null>(null); // null = đang loading ban đầu
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Loading cho các action

  // State duy nhất để lưu thông tin phiên giữ chỗ
  const [holdInfo, setHoldInfo] = useState<HoldDetailsResponseDTO | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initializationRef = useRef(false); // Đảm bảo chỉ init một lần

  const items = useCartStore((state) => state.items);
  const eventInfo = useCartStore((state) => state.eventInfo);
  const [isPurchaseComplete, setIsPurchaseComplete] = useState(false);

  // Memoized function để fetch hold details
  const fetchHoldDetails = useCallback(async (holdId: string) => {
    try {
      const holdDetails = await getHoldDetailsAPI(holdId);
      setHoldInfo(holdDetails);
      setStep("PAYMENT");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Phiên giữ chỗ không hợp lệ hoặc đã hết hạn.");
        setStep("ERROR");
      }
    }
  }, []);

  // Effect initialization - với dependencies đúng
  useEffect(() => {
    // Tránh chạy lại nếu đã init
    if (initializationRef.current) return;
    initializationRef.current = true;

    const holdIdFromUrl = searchParams.get("holdId");

    if (holdIdFromUrl) {
      // === LUỒNG MUA NHANH: Có holdId trên URL ===
      fetchHoldDetails(holdIdFromUrl);
    } else {
      // === LUỒNG GIỎ HÀNG: Không có holdId trên URL ===
      if (Object.keys(items).length === 0) {
        setError("Giỏ hàng của bạn đang trống.");
        setStep("ERROR");
      } else {
        setStep("CART_SUMMARY");
      }
    }
  }, [searchParams, items, fetchHoldDetails]); // Dependencies đúng

  // Effect để tự động giải phóng vé khi người dùng rời trang
  useEffect(() => {
    const currentHoldId = holdInfo?.holdId;
    // Chỉ chạy nếu có holdId và chưa hoàn tất thanh toán
    if (!currentHoldId || isPurchaseComplete) return;

    const releaseOnPageHide = () => {
      // Chỉ thực hiện khi người dùng rời khỏi trang hoàn toàn
      // (visibilityState sẽ là 'hidden' khi chuyển tab, unload khi đóng)
      if (document.visibilityState === "hidden") {
        releaseTicketsBeaconAPI(currentHoldId);
      }
    };

    // 'visibilitychange' là sự kiện tốt hơn 'beforeunload' vì nó đáng tin cậy hơn
    // và hoạt động tốt trên mobile khi chuyển app.
    document.addEventListener("visibilitychange", releaseOnPageHide);

    return () => {
      document.removeEventListener("visibilitychange", releaseOnPageHide);
    };
  }, [holdInfo?.holdId, isPurchaseComplete]);

  // HÀNH ĐỘNG: Tạo phiên giữ chỗ từ giỏ hàng hiện tại
  const createHoldFromCart = useCallback(async () => {
    if (!eventInfo || Object.keys(items).length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const requestDTO = createHoldRequestDTO(items, eventInfo);
      const response = await holdTicketsAPI(eventInfo.id, requestDTO);
      const details: HoldDetailsResponseDTO = {
        ...response,
        eventId: eventInfo.id,
        request: requestDTO,
      };

      setHoldInfo(details);
      setStep("PAYMENT");
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || "Không thể giữ chỗ. Vé có thể đã được bán hết."
        );
      }
      setStep("ERROR");
    } finally {
      setIsProcessing(false);
    }
  }, [eventInfo, items]);

  // HÀNH ĐỘNG: Xử lý thanh toán chuyển hướng (MoMo/VNPAY)
  const processRedirectPayment = async (method: "MOMO" | "VNPAY") => {
    if (!holdInfo) return;
    setIsProcessing(true);
    setStep("LOADING");
    setError(null);
    try {
      const response = await createPaymentAPI({
        holdId: holdInfo.holdId,
        paymentMethod: method,
      });
      setIsPurchaseComplete(true);
      setHoldInfo(null);
      // Chuyển hướng người dùng đến URL của cổng thanh toán
      window.location.href = response.paymentUrl;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Không thể tạo yêu cầu thanh toán.");
      }
      setStep("ERROR");
      setIsProcessing(false);
    }
  };

  // HÀNH ĐỘNG: Xử lý thanh toán giả lập
  const processMockPayment = async () => {
    if (!holdInfo) return;
    setStep("LOADING");
    setError(null);
    try {
      const response = await mockFinalizeAPI({ holdId: holdInfo.holdId });
      setIsPurchaseComplete(true);
      setHoldInfo(null);
      router.push(`/checkout/success?purchaseId=${response.purchaseId}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Thanh toán giả lập thất bại.");
        setStep("ERROR");
      }
    }
  };

  // HÀNH ĐỘNG: Xử lý khi hết giờ giữ chỗ
  const handleHoldExpired = useCallback(() => {
    setError("Phiên giữ chỗ của bạn đã hết hạn. Vui lòng chọn lại vé.");
    setStep("ERROR");
    setHoldInfo(null);
  }, []);

  // HÀNH ĐỘNG: Khi người dùng muốn thử lại sau lỗi
  const resetAndRedirect = useCallback(() => {
    if (eventInfo?.slug) {
      router.push(`/events/${eventInfo.slug}`);
    } else {
      router.push("/");
    }
  }, [eventInfo?.slug, router]);

  // Show loading chỉ khi step = null (đang khởi tạo) hoặc khi đang xử lý API
  if (step === null) {
    return (
      <div className="max-w-2xl mx-auto my-8">
        <div className="flex justify-center items-center p-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // --- LOGIC RENDER ---
  const renderContent = () => {
    switch (step) {
      case "LOADING":
        return (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        );

      case "ERROR":
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Đã có lỗi xảy ra!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button
              onClick={resetAndRedirect}
              variant="link"
              className="p-0 h-auto mt-2 text-destructive"
              disabled={isProcessing}
            >
              Quay lại và thử lại
            </Button>
          </Alert>
        );

      case "PAYMENT":
        if (holdInfo) {
          return (
            <PaymentForm
              holdDetails={holdInfo}
              onFinalizeRedirect={processRedirectPayment}
              onFinalizeMock={processMockPayment}
              onExpire={handleHoldExpired}
              isLoading={isProcessing}
            />
          );
        }
        return null;

      case "CART_SUMMARY":
      default:
        return (
          <CartSummary
            onProceed={createHoldFromCart}
            isLoading={isProcessing}
          />
        );
    }
  };

  return <div className="max-w-2xl mx-auto my-8">{renderContent()}</div>;
}

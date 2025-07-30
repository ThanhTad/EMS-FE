// app/(main)/checkout/success/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircleIcon,
  CalendarIcon,
  HomeIcon,
  HistoryIcon,
  ArmchairIcon,
  TicketIcon,
  AlertCircle,
} from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { getPurchaseDetailsById } from "@/lib/api";
import { PurchaseDetailDTO } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCartStore } from "@/stores/cartStore";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchaseId");
  const clearCart = useCartStore((state) => state.clearCart);

  const [purchase, setPurchase] = useState<PurchaseDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!purchaseId) {
      setError("Thiếu thông tin đơn hàng. Đang chuyển hướng về trang chủ...");
      const timer = setTimeout(() => router.push("/"), 3000);
      return () => clearTimeout(timer);
    }

    const loadPurchaseData = async (id: string) => {
      try {
        setLoading(true);
        const purchaseData = await getPurchaseDetailsById(id);
        setPurchase(purchaseData);
        clearCart();
      } catch (err) {
        console.error("Failed to load purchase data:", err);
        setError(
          "Không thể tải thông tin đơn hàng. Có thể đơn hàng không tồn tại hoặc bạn không có quyền xem."
        );
      } finally {
        setLoading(false);
      }
    };
    loadPurchaseData(purchaseId);
  }, [clearCart, purchaseId, router]);

  if (loading) return <SuccessSkeleton />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 my-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Đã có lỗi xảy ra!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!purchase) {
    return (
      <p className="text-center my-8">Không tìm thấy thông tin đơn hàng.</p>
    );
  }

  const { event, generalAdmissionTickets, seatedTickets } = purchase;
  const totalItemCount =
    (generalAdmissionTickets?.reduce((sum, t) => sum + t.quantity, 0) || 0) +
    (seatedTickets?.length || 0);
  console.log("Purchase details:", purchase);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 my-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-green-600">
            Thanh toán thành công!
          </h1>
          <p className="text-muted-foreground mt-2">
            Vé của bạn đã được xác nhận. Vui lòng kiểm tra email để nhận vé điện
            tử.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-muted-foreground">Mã đơn hàng:</span>{" "}
            <span className="font-mono text-sm">{purchase.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Trạng thái:</span>{" "}
            <Badge
              variant={
                purchase.status === "COMPLETED" ? "default" : "secondary"
              }
            >
              {purchase.status}
            </Badge>
          </div>
          <Separator />

          <h4 className="font-medium">Các vé đã đặt ({totalItemCount}):</h4>
          <div className="space-y-2">
            {generalAdmissionTickets?.map((gaTicket, index) => (
              <div
                key={`ga-${index}`}
                className="flex justify-between items-center text-sm"
              >
                <span className="flex items-center gap-2">
                  <TicketIcon className="h-4 w-4 text-muted-foreground" />
                  {gaTicket.ticketName} (x{gaTicket.quantity})
                </span>
                <span className="font-semibold">
                  {formatPrice(gaTicket.pricePerTicket * gaTicket.quantity)}
                </span>
              </div>
            ))}
            {seatedTickets?.map((seat, index) => (
              <div
                key={`seat-${index}`}
                className="flex justify-between items-center text-sm"
              >
                <span className="flex items-center gap-2">
                  <ArmchairIcon className="h-4 w-4 text-muted-foreground" />
                  Ghế {seat.seatNumber} (Hàng {seat.rowLabel} -{" "}
                  {seat.sectionName})
                </span>
                <span className="font-semibold">
                  {formatPrice(seat.priceAtPurchase)}
                </span>
              </div>
            ))}
          </div>

          <Separator />
          <div className="space-y-2 pt-2 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{formatPrice(purchase.subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí dịch vụ:</span>
              <span>{formatPrice(purchase.serviceFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-primary">
                {formatPrice(purchase.totalPrice)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {event && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sự kiện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              {formatDateTime(event.startDate).date} lúc{" "}
              {formatDateTime(event.startDate).time}
            </div>
            {/* Nếu bạn đã thêm venue vào EventInfoDTO, bạn có thể bỏ comment dòng dưới */}
            {/* <div className="flex items-center gap-2 text-muted-foreground">
              <MapPinIcon className="h-4 w-4" />
              {event.venue?.name} 
            </div> */}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push("/")} className="flex-1">
          <HomeIcon className="mr-2 h-4 w-4" /> Về trang chủ
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/my-tickets")}
          className="flex-1"
        >
          <HistoryIcon className="mr-2 h-4 w-4" /> Xem vé của tôi
        </Button>
      </div>
    </div>
  );
}

// Component Skeleton cho trạng thái đang tải
function SuccessSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 my-8 animate-pulse">
      <div className="text-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Separator />
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          <Separator />
          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}

// Component Page mặc định, sử dụng Suspense
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessSkeleton />}>
      <SuccessContent />
    </Suspense>
  );
}

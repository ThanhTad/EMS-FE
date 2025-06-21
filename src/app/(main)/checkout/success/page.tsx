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
  MapPinIcon,
  HomeIcon,
  HistoryIcon,
  ArmchairIcon,
} from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { getPurchaseById } from "@/lib/api"; // <<< SỬA: API chuẩn để lấy 1 đơn hàng
import { TicketPurchase } from "@/types";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchaseId"); // <<< SỬA: Lấy purchaseId

  // <<< SỬA: State là một object TicketPurchase, không phải mảng
  const [purchase, setPurchase] = useState<TicketPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!purchaseId) {
      setError("Thiếu thông tin đơn hàng. Đang chuyển hướng...");
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    const loadPurchaseData = async (id: string) => {
      try {
        setLoading(true);
        const purchaseData = await getPurchaseById(id); // <<< SỬA: Gọi API đúng
        if (purchaseData) {
          setPurchase(purchaseData);
        } else {
          setError("Không tìm thấy chi tiết đơn hàng.");
        }
      } catch (err) {
        if (err instanceof Error)
          setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    loadPurchaseData(purchaseId);
  }, [purchaseId, router]);

  if (loading) return <SuccessSkeleton />;
  if (error) {
    /* ... giữ nguyên logic xử lý lỗi ... */
  }
  if (!purchase) return <p>Không tìm thấy đơn hàng.</p>;

  const { event, status } = purchase;
  const totalItemCount =
    (purchase.purchasedGaTickets?.reduce((sum, t) => sum + t.quantity, 0) ||
      0) + (purchase.purchasedSeats?.length || 0);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-green-600">
            Thanh toán thành công!
          </h1>
          <p className="text-muted-foreground mt-2">
            Vé của bạn đã được đặt. Vui lòng kiểm tra email để nhận vé điện tử.
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
            <Badge variant="secondary">{status?.status}</Badge>
          </div>
          <Separator />

          <h4 className="font-medium">Các vé đã đặt:</h4>
          <div className="space-y-2">
            {/* <<< SỬA: Lặp qua vé GA */}
            {purchase.purchasedGaTickets?.map((gaTicket) => (
              <div
                key={gaTicket.id}
                className="flex justify-between items-center text-sm"
              >
                <span>
                  {gaTicket.ticket?.name} (x{gaTicket.quantity})
                </span>
                <span className="font-semibold">
                  {formatPrice(gaTicket.pricePerTicket * gaTicket.quantity)}
                </span>
              </div>
            ))}
            {/* <<< SỬA: Lặp qua vé đã chọn ghế */}
            {purchase.purchasedSeats?.map((seat) => (
              <div
                key={seat.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="flex items-center gap-2">
                  <ArmchairIcon className="h-4 w-4" /> Ghế{" "}
                  {seat.seat?.seatNumber} (Hàng {seat.seat?.rowLabel})
                </span>
                <span className="font-semibold">
                  {seat.priceAtPurchase !== undefined
                    ? formatPrice(seat.priceAtPurchase)
                    : "N/A"}
                </span>
              </div>
            ))}
          </div>

          <Separator />
          <div className="space-y-2 pt-2 text-sm">
            <div className="flex justify-between">
              <span>Tổng số vé:</span>
              <span className="font-medium">{totalItemCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>
                {purchase.subtotal !== undefined
                  ? formatPrice(purchase.subtotal)
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phí dịch vụ:</span>
              <span>
                {purchase.serviceFee !== undefined
                  ? formatPrice(purchase.serviceFee)
                  : "N/A"}
              </span>
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
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPinIcon className="h-4 w-4" />
              {event.venue?.name}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push("/")} className="flex-1">
          <HomeIcon className="mr-2 h-4 w-4" />
          Về trang chủ
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/my-tickets")}
          className="flex-1"
        >
          <HistoryIcon className="mr-2 h-4 w-4" />
          Xem vé của tôi
        </Button>
      </div>
    </div>
  );
}

// Component Skeleton cho trạng thái đang tải
function SuccessSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 animate-pulse">
      <div className="text-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Separator />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
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

// app/(main)/checkout/page.tsx
"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCartStore } from "@/stores/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  MapPinIcon,
  TicketIcon,
  CreditCardIcon,
  LoaderIcon,
  ArmchairIcon,
} from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { initiateTicketPurchase } from "@/lib/api";
import { InitiatePurchaseRequest, PurchaseItem } from "@/types"; // <<< SỬA: Dùng type từ types.ts

function CheckoutContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { event, items, getTotalPrice, getTotalQuantity, clearCart } =
    useCartStore();

  // <<< SỬA: Chuyển Map thành mảng để render
  const cartItems = useMemo(() => Array.from(items.values()), [items]);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
    // <<< SỬA: Dùng getTotalQuantity()
    if (!authLoading && isAuthenticated && getTotalQuantity() === 0) {
      if (!error) {
        setError("Giỏ hàng của bạn đang trống. Đang chuyển hướng...");
        setTimeout(() => router.back(), 3000);
      }
    }
  }, [authLoading, isAuthenticated, getTotalQuantity, router, error]);

  const handlePurchase = async () => {
    if (!user || !event || getTotalQuantity() === 0) return;

    setProcessing(true);
    setError(null);
    try {
      // <<< SỬA: Tạo payload đúng chuẩn từ cartStore mới
      const purchaseItems: PurchaseItem[] = [];
      const seatedItemsByTicket = new Map<string, string[]>(); // Gom các ghế theo loại vé

      for (const item of cartItems) {
        if (item.type === "GA") {
          purchaseItems.push({
            ticketId: item.ticket.id,
            quantity: item.quantity,
          });
        } else if (item.type === "SEATED") {
          if (!seatedItemsByTicket.has(item.ticket.id)) {
            seatedItemsByTicket.set(item.ticket.id, []);
          }
          seatedItemsByTicket.get(item.ticket.id)!.push(item.seat.id);
        }
      }

      // Thêm các vé đã chọn ghế vào payload cuối cùng
      for (const [ticketId, seatIds] of seatedItemsByTicket.entries()) {
        purchaseItems.push({
          ticketId: ticketId,
          seatIds: seatIds,
        });
      }

      const payload: InitiatePurchaseRequest = {
        eventId: event.id,
        items: purchaseItems,
      };

      const paymentResponse = await initiateTicketPurchase(payload);

      clearCart();

      if (paymentResponse.paymentUrl) {
        window.location.href = paymentResponse.paymentUrl;
      } else {
        // Xử lý trường hợp thanh toán tại chỗ hoặc thanh toán thành công ngay
        router.push(
          `/checkout/success?purchaseId=${paymentResponse.purchaseId}`
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi xử lý thanh toán";
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || !event || getTotalQuantity() === 0) {
    if (error) {
      return (
        <div className="max-w-2xl mx-auto p-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      );
    }
    return <CheckoutSkeleton />;
  }

  const totalPrice = getTotalPrice();
  const { date, time } = formatDateTime(event.startDate);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold dark:text-white">
          Xác nhận & Thanh toán
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Thông tin sự kiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mt-2 text-sm">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {date}
                  {time && ` lúc ${time}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                <MapPinIcon className="h-4 w-4" />
                <span>
                  {event.venue?.name} - {event.venue?.address}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5" />
                Chi tiết đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.type === "GA" ? item.ticket.id : item.seat.id}
                  className="pb-3 border-b last:border-b-0 dark:border-gray-700"
                >
                  {/* <<< SỬA: Hiển thị khác nhau cho vé GA và vé SEATED */}
                  {item.type === "GA" ? (
                    <div className="flex justify-between items-center font-medium">
                      <span>
                        {item.ticket.name} (x{item.quantity})
                      </span>
                      <span>
                        {formatPrice(item.ticket.price * item.quantity)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center font-medium">
                      <div className="flex items-center gap-2">
                        <ArmchairIcon className="h-4 w-4 text-primary" />
                        <span>
                          Ghế {item.seat.seatNumber} (Hàng {item.seat.rowLabel})
                          - {item.ticket.name}
                        </span>
                      </div>
                      <span>{formatPrice(item.ticket.price)}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {/* Phần này có thể hiển thị tóm tắt, ví dụ: */}
                <div className="flex justify-between text-sm">
                  <span>Số lượng vé</span>
                  <span>{getTotalQuantity()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí dịch vụ</span>
                  <span>Miễn phí</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <div className="mt-4 text-sm">
                <p>
                  <strong>Khách hàng:</strong>{" "}
                  {user?.fullName || user?.username}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
              </div>
              <Button
                onClick={handlePurchase}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCardIcon className="mr-2 h-4 w-4" />
                )}
                Thanh toán
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-pulse">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}

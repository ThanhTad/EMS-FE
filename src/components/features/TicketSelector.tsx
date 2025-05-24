// components/shared/TicketSelector.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Ticket as TicketIcon, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { initiateTicketPurchase, confirmPurchase } from "@/lib/api";

interface TicketSelectorProps {
  tickets: Ticket[];
}

const TicketSelector: React.FC<TicketSelectorProps> = ({ tickets }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const totalQuantitySelected = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    [quantities]
  );

  const totalPrice = useMemo(
    () =>
      tickets.reduce((sum, ticket) => {
        const qty = quantities[ticket.id] || 0;
        return sum + qty * ticket.price;
      }, 0),
    [tickets, quantities]
  );

  const handleQuantityChange = (ticketId: string, newQty: number) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const maxAllowed = Math.min(
      ticket.availableQuantity,
      ticket.maxPerUser ?? Infinity
    );
    const qty = Math.max(0, Math.min(newQty, maxAllowed));
    setQuantities((prev) => ({ ...prev, [ticketId]: qty }));
  };

  const skipPayment =
    process.env.NEXT_PUBLIC_SKIP_PAYMENT === "true" ||
    (typeof window !== "undefined" && window.location.hostname === "localhost");

  const handleBuy = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để mua vé.");
      return;
    }

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketId, quantity]) => ({ ticketId, quantity }));
    if (items.length === 0) {
      toast.error("Chưa chọn vé. Vui lòng chọn số lượng.");
      return;
    }
    if (items.length > 1) {
      toast.error("Hiện chỉ hỗ trợ mua một loại vé mỗi lần.");
      return;
    }

    const { ticketId, quantity } = items[0];

    setIsLoading(true);
    try {
      const payment = await initiateTicketPurchase({
        userId: user.id,
        ticketId,
        quantity,
      });

      if (skipPayment) {
        await confirmPurchase(payment.purchaseId);
        toast.success("Mua vé thành công!");
        router.push("/my-tickets");
      } else {
        window.location.href = payment.paymentUrl;
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể mua vé. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAvailable = tickets.some((t) => t.availableQuantity > 0);

  return (
    <Card className="sticky top-20 shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <TicketIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />{" "}
          Mua vé
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Chọn loại vé và số lượng.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {tickets.length === 0 && (
          <p className="text-center text-muted-foreground dark:text-muted-foreground py-4">
            Chưa có vé cho sự kiện này.
          </p>
        )}

        {tickets.map((ticket) => {
          const qty = quantities[ticket.id] || 0;
          const soldOut = ticket.availableQuantity <= 0;
          const maxAllowed = Math.min(
            ticket.availableQuantity,
            ticket.maxPerUser ?? Infinity
          );
          return (
            <div
              key={ticket.id}
              className={`rounded-lg p-4 ${
                soldOut ? "opacity-60 bg-muted/50 dark:bg-muted/60" : ""
              } border-border dark:border-gray-700`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {ticket.ticketType}
                </h4>
                <p
                  className={`font-bold text-lg ${
                    ticket.isFree
                      ? "text-green-600 dark:text-green-400"
                      : "text-primary dark:text-primary"
                  }`}
                >
                  {formatPrice(ticket.price)}
                </p>
              </div>

              {ticket.description && (
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                  {ticket.description}
                </p>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                {soldOut ? (
                  <Badge
                    variant="destructive"
                    className="dark:border-destructive dark:text-destructive-foreground"
                  >
                    Hết vé
                  </Badge>
                ) : (
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    Còn lại: {ticket.availableQuantity}/{ticket.totalQuantity}{" "}
                    vé
                    {ticket.maxPerUser &&
                      ` (Tối đa ${ticket.maxPerUser}/người)`}
                  </p>
                )}

                {!soldOut && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-200 dark:border-gray-600 dark:text-gray-100"
                      onClick={() => handleQuantityChange(ticket.id, qty - 1)}
                      disabled={qty <= 0 || isLoading}
                    >
                      <Minus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </Button>
                    <Input
                      type="number"
                      className="h-8 w-14 text-center dark:bg-gray-700 dark:text-white"
                      value={qty}
                      onChange={(e) =>
                        handleQuantityChange(
                          ticket.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      min={0}
                      max={maxAllowed}
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-200 dark:border-gray-600 dark:text-gray-100"
                      onClick={() => handleQuantityChange(ticket.id, qty + 1)}
                      disabled={qty >= maxAllowed || isLoading}
                    >
                      <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!hasAvailable && tickets.length > 0 && (
          <Alert
            variant="default"
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <Info className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <AlertTitle className="dark:text-white">Đã hết vé</AlertTitle>
            <AlertDescription className="dark:text-gray-400">
              Rất tiếc, vé cho sự kiện này đã được bán hết.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {hasAvailable && (
        <>
          <Separator className="my-4 border-gray-200 dark:border-gray-700" />
          <CardFooter className="flex flex-col gap-4">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span className="text-gray-900 dark:text-white">Tổng cộng:</span>
              <span className="text-gray-900 dark:text-white">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              size="lg"
              onClick={handleBuy}
              disabled={totalQuantitySelected === 0 || isLoading}
              className="dark:bg-primary dark:text-white"
            >
              {isLoading
                ? skipPayment
                  ? "Đang xử lý..."
                  : "Chuyển tới thanh toán..."
                : skipPayment
                ? `Mua ngay (${totalQuantitySelected} vé)`
                : `Thanh toán (${totalQuantitySelected} vé)`}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default TicketSelector;

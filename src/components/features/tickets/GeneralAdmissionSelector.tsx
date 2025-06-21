// components/features/tickets/GeneralAdmissionSelector.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCartStore } from "@/stores/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  TicketIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  AlertCircleIcon,
  LoaderIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Ticket } from "@/types";

interface Props {
  tickets: Ticket[];
}

export default function GeneralAdmissionSelector({ tickets }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { updateGaQuantity, items, getTotalPrice, getTotalQuantity } =
    useCartStore();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (ticket: Ticket, newQuantity: number) => {
    setError(null);
    if (newQuantity < 0) return;

    const maxQty = ticket.maxPerPurchase ?? ticket.availableQuantity ?? 5;
    if (newQuantity > (ticket.availableQuantity ?? Infinity)) {
      setError(`Chỉ còn ${ticket.availableQuantity} vé cho loại này.`);
      updateGaQuantity(ticket, ticket.availableQuantity ?? 0);
      return;
    }
    if (newQuantity > maxQty) {
      setError(`Bạn chỉ có thể mua tối đa ${maxQty} vé loại này mỗi lần.`);
      updateGaQuantity(ticket, maxQty);
      return;
    }

    updateGaQuantity(ticket, newQuantity);
  };

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    if (getTotalQuantity() === 0) {
      setError("Vui lòng chọn ít nhất 1 vé.");
      return;
    }
    setIsLoading(true);
    router.push("/checkout");
  };

  return (
    <Card className="dark:bg-gray-900 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <TicketIcon className="h-5 w-5" />
          Chọn vé
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tickets.map((ticket) => {
          const cartItem = items.get(ticket.id);
          const quantity = cartItem?.type === "GA" ? cartItem.quantity : 0;
          const isSelected = quantity > 0;

          return (
            <div
              key={ticket.id}
              className={`border rounded-lg p-4 space-y-3 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "dark:border-gray-700"
              }`}
            >
              <div>
                <h4 className="font-semibold dark:text-white">{ticket.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {ticket.description}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(ticket.price)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(ticket, quantity - 1)}
                    disabled={quantity <= 0}
                  >
                    {" "}
                    <MinusIcon className="h-4 w-4" />{" "}
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        ticket,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-16 h-8 text-center"
                    min="0"
                    max={ticket.availableQuantity}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(ticket, quantity + 1)}
                    disabled={
                      quantity >= (ticket.availableQuantity ?? Infinity)
                    }
                  >
                    {" "}
                    <PlusIcon className="h-4 w-4" />{" "}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Còn {ticket.availableQuantity} vé
              </p>
            </div>
          );
        })}

        {getTotalQuantity() > 0 && (
          <div className="pt-4 mt-4 border-t dark:border-gray-700">
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng tiền:</span>
                <span className="text-primary">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <Button
                onClick={handleProceedToCheckout}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCartIcon className="mr-2 h-4 w-4" />
                )}
                Tiến hành thanh toán
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheckIcon className="h-3 w-3 text-green-500" />
                <span>Thanh toán an toàn 100%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

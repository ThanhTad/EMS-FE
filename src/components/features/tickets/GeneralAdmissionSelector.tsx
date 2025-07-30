// components/features/tickets/GeneralAdmissionSelector.tsx
"use client";

import { GeneralAdmissionData, Ticket } from "@/types";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Ticket as TicketIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";

// --- Sub-component cho một loại vé ---
interface TicketItemProps {
  ticket: Ticket;
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

const TicketItem: React.FC<TicketItemProps> = ({
  ticket,
  quantity,
  onQuantityChange,
}) => {
  const maxQuantity = ticket.maxPerPurchase || 10;
  const availableQuantity = ticket.availableQuantity || 0;
  const canPurchaseMax = Math.min(maxQuantity, availableQuantity);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg">
      <div className="flex-1">
        <h4 className="font-bold">{ticket.name}</h4>
        <p className="text-lg font-semibold text-primary">
          {ticket.price.toLocaleString()} VNĐ
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {ticket.description}
        </p>
        {availableQuantity <= 10 && availableQuantity > 0 && (
          <p className="text-xs text-red-500 font-semibold mt-1">
            Chỉ còn {availableQuantity} vé!
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
          disabled={quantity === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="font-bold text-lg w-12 text-center">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            onQuantityChange(Math.min(canPurchaseMax, quantity + 1))
          }
          disabled={quantity >= canPurchaseMax}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// --- Component chính ---
interface GeneralAdmissionSelectorProps {
  data: GeneralAdmissionData;
}

const GeneralAdmissionSelector: React.FC<GeneralAdmissionSelectorProps> = ({
  data,
}) => {
  const router = useRouter();
  const { updateGaQuantity, items: cartItems } = useCartStore((state) => ({
    updateGaQuantity: state.updateGaQuantity,
    items: state.items,
  }));

  // Lấy số lượng từ cartStore để hiển thị
  const ticketQuantities = useMemo(() => {
    const quantities = new Map<string, number>();
    Object.values(cartItems).forEach((item) => {
      if (item.type === "GA") {
        quantities.set(item.ticket.id, item.quantity);
      }
    });
    return quantities;
  }, [cartItems]);

  const handleQuantityChange = (ticket: Ticket, newQuantity: number) => {
    updateGaQuantity(ticket, newQuantity);
  };

  const handleProceedToCheckout = () => {
    if (totalItems === 0) {
      toast.error("Vui lòng chọn ít nhất một vé.");
      return;
    }
    router.push("/checkout");
  };

  const totalItems = Array.from(ticketQuantities.values()).reduce(
    (sum, q) => sum + q,
    0
  );
  const totalPrice = Array.from(ticketQuantities.entries()).reduce(
    (sum, [ticketId, quantity]) => {
      const ticket = data.availableTickets.find((t) => t.id === ticketId);
      return sum + (ticket ? ticket.price * quantity : 0);
    },
    0
  );

  // Giả sử statusId cho "On Sale" là một hằng số
  const STATUS_ON_SALE = 301;

  return (
    <div className="p-4 border rounded-lg shadow-md flex flex-col gap-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <TicketIcon /> Chọn vé của bạn
      </h3>
      <div className="space-y-4">
        {data.availableTickets.filter((t) => t.statusId === STATUS_ON_SALE)
          .length > 0 ? (
          data.availableTickets
            .filter((t) => t.statusId === STATUS_ON_SALE)
            .map((ticket) => (
              <TicketItem
                key={ticket.id}
                ticket={ticket}
                quantity={ticketQuantities.get(ticket.id) || 0}
                onQuantityChange={(newQuantity) =>
                  handleQuantityChange(ticket, newQuantity)
                }
              />
            ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Hiện chưa có vé nào được mở bán cho sự kiện này.
          </p>
        )}
      </div>

      {totalItems > 0 && (
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-slate-50/50 rounded-lg border sticky bottom-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              Đã chọn:{" "}
              <span className="font-bold text-primary">{totalItems} vé</span>
            </p>
            <p className="text-lg font-bold">
              Tổng:{" "}
              <span className="text-primary">
                {totalPrice.toLocaleString()} VNĐ
              </span>
            </p>
          </div>
          <Button
            onClick={handleProceedToCheckout}
            size="lg"
            className="w-full md:w-auto"
          >
            Thanh toán
          </Button>
        </div>
      )}
    </div>
  );
};

export default GeneralAdmissionSelector;

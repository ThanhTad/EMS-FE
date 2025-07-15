//components/features/tickets/GeneralAdmissionSelector.tsx
"use client";

import {
  GeneralAdmissionData,
  TicketType,
  TicketSelectionModeEnum,
  GaItemDTO,
  TicketHoldRequest,
} from "@/types";
import React, { useState } from "react";
import { holdTicketsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

interface TicketItemProps {
  ticket: TicketType;
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

interface GeneralAdmissionSelectorProps {
  data: GeneralAdmissionData;
  eventId: string;
}

const GeneralAdmissionSelector: React.FC<GeneralAdmissionSelectorProps> = ({
  data,
  eventId,
}) => {
  const router = useRouter(); // Khởi tạo router
  const [ticketQuantities, setTicketQuantities] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (ticketId: string, newQuantity: number) => {
    const newQuantities = new Map(ticketQuantities);
    if (newQuantity > 0) {
      newQuantities.set(ticketId, newQuantity);
    } else {
      newQuantities.delete(ticketId);
    }
    setTicketQuantities(newQuantities);
  };

  // THAY ĐỔI 2: Sửa lại hàm handleHoldTickets để gửi một lần duy nhất
  const handleHoldTickets = async () => {
    // Chuyển đổi Map sang mảng gaItems
    const gaItems: GaItemDTO[] = Array.from(ticketQuantities.entries())
      .map(([ticketId, quantity]) => ({ ticketId, quantity }))
      .filter((item) => item.quantity > 0);

    if (gaItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một vé.");
      return;
    }

    setIsLoading(true);
    try {
      // Tạo payload theo đúng DTO
      const payload: TicketHoldRequest = {
        selectionMode: TicketSelectionModeEnum.GENERAL_ADMISSION,
        gaItems: gaItems,
        seatIds: [], // Luôn là mảng rỗng
      };

      // Gọi API một lần duy nhất
      const response = await holdTicketsAPI(eventId, payload);

      toast.success(`Giữ vé thành công. Đang chuyển đến trang thanh toán...`);

      // Chuyển hướng người dùng đến trang checkout
      router.push(`/checkout?holdId=${response.holdId}`);
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage =
          error.message || "Giữ vé thất bại. Vui lòng thử lại.";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = Array.from(ticketQuantities.values()).reduce(
    (sum, q) => sum + q,
    0
  );
  const totalPrice = Array.from(ticketQuantities.entries()).reduce(
    (sum, [ticketId, quantity]) => {
      const ticket = data.availableTickets.find((t) => t.ticketId === ticketId);
      return sum + (ticket ? ticket.price * quantity : 0);
    },
    0
  );

  return (
    <div className="p-4 border rounded-lg shadow-md flex flex-col gap-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Ticket /> Chọn vé của bạn
      </h3>
      <div className="space-y-4">
        {data.availableTickets.filter((t) => t.isOnSale).length > 0 ? (
          data.availableTickets
            .filter((t) => t.isOnSale)
            .map((ticket) => (
              <TicketItem
                key={ticket.ticketId}
                ticket={ticket}
                quantity={ticketQuantities.get(ticket.ticketId) || 0}
                onQuantityChange={(newQuantity) =>
                  handleQuantityChange(ticket.ticketId, newQuantity)
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
          {/* THAY ĐỔI 3: onClick sẽ gọi trực tiếp handleHoldTickets */}
          <Button
            onClick={handleHoldTickets}
            disabled={isLoading}
            size="lg"
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Tiếp tục"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GeneralAdmissionSelector;

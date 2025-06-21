// components/features/tickets/TicketSelector.tsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Ticket, Event, TicketSelectionModeEnum } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, TicketIcon } from "lucide-react";
import GeneralAdmissionSelector from "./GeneralAdmissionSelector";
import ReservedSeatingSelector from "./ReservedSeatingSelector";

interface Props {
  tickets: Ticket[];
  event: Event;
}

export default function TicketSelector({ tickets, event }: Props) {
  const { setEvent, clearCart, event: currentEventInCart } = useCartStore();

  // Khi event thay đổi, reset giỏ hàng cho event mới
  useEffect(() => {
    if (currentEventInCart?.id !== event.id) {
      setEvent(event);
      clearCart();
    }
  }, [event, setEvent, clearCart, currentEventInCart?.id]);

  // Lọc vé có thể bán (có status phù hợp và còn hàng)
  const availableTickets = tickets.filter(
    (t) =>
      t.status?.status === "AVAILABLE" &&
      typeof t.availableQuantity === "number" &&
      t.availableQuantity > 0
  );

  if (!availableTickets.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            Vé sự kiện
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              Tất cả vé cho sự kiện này đã được bán hết.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const renderSelector = () => {
    switch (event.ticketSelectionMode) {
      case TicketSelectionModeEnum.GENERAL_ADMISSION:
        return <GeneralAdmissionSelector tickets={availableTickets} />;
      case TicketSelectionModeEnum.SEATED:
        // Cả ZONED_ADMISSION và RESERVED_SEATING đều dùng component này.
        // Component sẽ tự quyết định hiển thị UI chọn zone hay chọn ghế chi tiết.
        return (
          <ReservedSeatingSelector event={event} tickets={availableTickets} />
        );
      default:
        return <p>Chế độ chọn vé không được hỗ trợ.</p>;
    }
  };

  return <>{renderSelector()}</>;
}

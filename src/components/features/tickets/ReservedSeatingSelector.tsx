// components/features/tickets/ReservedSeatingSelector.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCartStore } from "@/stores/cartStore";
import { getEventSeatStatuses, getSeatMapDetails } from "@/lib/api";
import { Ticket, Event, SeatMap, SeatSection, Seat } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LoaderIcon,
  ArmchairIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@radix-ui/react-separator";

interface Props {
  event: Event;
  tickets: Ticket[];
}

interface SeatWithStatus extends Seat {
  status: "available" | "sold" | "held" | "selected";
  ticketId?: string;
  price?: number;
}

function parseStatus(status?: string): SeatWithStatus["status"] {
  if (status === "sold" || status === "held" || status === "available") {
    return status;
  }
  return "available";
}

export default function ReservedSeatingSelector({ event, tickets }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addSeat, removeSeat, items, getTotalPrice, getTotalQuantity } =
    useCartStore();

  const [seatMap, setSeatMap] = useState<
    | (SeatMap & { sections: (SeatSection & { seats: SeatWithStatus[] })[] })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ánh xạ ticketId tới thông tin giá vé cho mỗi section
  const sectionTicketMap = useMemo(() => {
    const map = new Map<string, { ticketId: string; price: number }>();
    tickets.forEach((ticket) => {
      if (ticket.appliesToSectionId) {
        map.set(ticket.appliesToSectionId, {
          ticketId: ticket.id,
          price: ticket.price,
        });
      }
    });
    return map;
  }, [tickets]);

  useEffect(() => {
    if (!event.seatMapId) return;

    const fetchSeatData = async () => {
      setIsLoading(true);
      try {
        const [mapDetails, seatStatuses] = await Promise.all([
          getSeatMapDetails(event.seatMapId!),
          getEventSeatStatuses(event.id),
        ]);

        const statusMap = new Map(
          seatStatuses.map((s) => [s.seatId, s.status])
        );

        const selectedSeats = new Set(Array.from(items.keys()));

        const enrichedMap = {
          ...mapDetails,
          sections: mapDetails.sections.map((section) => ({
            ...section,
            seats: section.seats.map((seat) => {
              const ticketInfo = sectionTicketMap.get(section.id);
              return {
                ...seat,
                status: selectedSeats.has(seat.id)
                  ? "selected"
                  : parseStatus(statusMap.get(seat.id)),
                ticketId: ticketInfo?.ticketId,
                price: ticketInfo?.price,
              };
            }),
          })),
        };

        setSeatMap(enrichedMap);
      } catch (error) {
        console.error("Lỗi khi tải sơ đồ ghế:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeatData();
  }, [event.id, event.seatMapId, sectionTicketMap, items]);

  const handleSeatClick = (seat: SeatWithStatus) => {
    if (seat.status === "sold" || seat.status === "held") return;

    if (seat.status === "selected") {
      removeSeat(seat.id);
    } else if (seat.status === "available" && seat.ticketId) {
      const ticket = tickets.find((t) => t.id === seat.ticketId);
      if (ticket) {
        addSeat(seat, ticket);
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <LoaderIcon className="w-8 h-8 animate-spin" />
          <p className="ml-2">Đang tải sơ đồ ghế...</p>
        </CardContent>
      </Card>
    );
  }

  if (!seatMap) {
    return <p>Không thể tải sơ đồ ghế cho sự kiện này.</p>;
  }

  const selectedItems = Array.from(items.values()).filter(
    (i) => i.type === "SEATED"
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Chọn vị trí của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <ArmchairIcon className="w-4 h-4 text-gray-400" /> Còn trống
            </div>
            <div className="flex items-center gap-1">
              <ArmchairIcon className="w-4 h-4 text-primary" /> Đang chọn
            </div>
            <div className="flex items-center gap-1">
              <XCircleIcon className="w-4 h-4 text-red-500" /> Đã bán
            </div>
          </div>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border p-4 max-h-[50vh]">
            <div className="flex justify-center">
              <div className="bg-gray-200 dark:bg-gray-700 text-center py-2 px-8 rounded-md mb-6 font-bold text-sm tracking-widest">
                SÂN KHẤU
              </div>
            </div>
            <Accordion
              type="multiple"
              defaultValue={seatMap.sections.map((s) => s.id)}
              className="w-full"
            >
              {seatMap.sections.map((section) => (
                <AccordionItem value={section.id} key={section.id}>
                  <AccordionTrigger className="text-lg font-semibold">
                    {section.name} -{" "}
                    {sectionTicketMap.get(section.id)?.price !== undefined
                      ? formatPrice(sectionTicketMap.get(section.id)!.price)
                      : "Miễn phí"}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-10 gap-2 p-2">
                      {section.seats.map((seat) => (
                        <Button
                          key={seat.id}
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 transition-transform hover:scale-110
                             ${
                               seat.status === "available"
                                 ? "text-gray-400 hover:bg-primary/20 hover:text-primary"
                                 : ""
                             }
                             ${
                               seat.status === "selected"
                                 ? "bg-primary text-primary-foreground"
                                 : ""
                             }
                             ${
                               seat.status === "sold"
                                 ? "bg-red-500/50 text-white cursor-not-allowed"
                                 : ""
                             }
                           `}
                          onClick={() => handleSeatClick(seat)}
                          disabled={
                            seat.status === "sold" || seat.status === "held"
                          }
                        >
                          <ArmchairIcon className="w-5 h-5" />
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {getTotalQuantity() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vé đã chọn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedItems.map(
                (item) =>
                  item.type === "SEATED" && (
                    <div
                      key={item.seat.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        Ghế {item.seat.seatNumber} (Hàng {item.seat.rowLabel})
                      </span>
                      <span className="font-semibold">
                        {formatPrice(item.ticket.price)}
                      </span>
                    </div>
                  )
              )}
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-primary">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleProceedToCheckout}
            >
              <ShoppingCartIcon className="mr-2 h-4 w-4" />
              Thanh toán
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// components/features/tickets/ReservedSeatingSelector.tsx
"use client";

import { ReservedSeatingData, Seat } from "@/types";
import React, { useMemo, FC } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePanAndZoom } from "@/hooks/usePanAndZoom";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { ZoomControls } from "@/components/shared/ZoomControls";
import { StaticMapLayout } from "@/components/shared/StaticMapLayout";

const SeatComponent: FC<{
  seat: Seat;
  isSelected: boolean;
  onClick: () => void;
}> = React.memo(({ seat, isSelected, onClick }) => {
  const { coordinates, status, rowLabel, seatNumber, price, ticketTypeName } =
    seat;
  if (!coordinates) return null;
  const fillColor = isSelected
    ? "hsl(142.1 76.2% 36.3%)"
    : status === "available"
    ? "hsl(221.2 83.2% 53.3%)"
    : "hsl(215 20.2% 65.1%)";
  return (
    <circle
      cx={coordinates.x}
      cy={coordinates.y}
      r="8"
      fill={fillColor}
      onClick={() => status === "available" && onClick()}
      className={`transition-colors duration-150 ${
        status === "available"
          ? "cursor-pointer hover:stroke-black hover:stroke-2"
          : "cursor-not-allowed opacity-60"
      } ${isSelected ? "stroke-black stroke-2" : ""}`}
    >
      <title>{`Hàng: ${rowLabel}, Ghế: ${seatNumber}\n${
        status === "available"
          ? `Loại vé: ${ticketTypeName || "Standard"}\nGiá: ${
              price?.toLocaleString() || 0
            } VNĐ`
          : `Trạng thái: Đã bán`
      }`}</title>
    </circle>
  );
});
SeatComponent.displayName = "SeatComponent";

interface ReservedSeatingSelectorProps {
  data: ReservedSeatingData;
}

const ReservedSeatingSelector: FC<ReservedSeatingSelectorProps> = ({
  data,
}) => {
  const router = useRouter();

  const addSeat = useCartStore((state) => state.addSeat);
  const removeSeat = useCartStore((state) => state.removeSeat);
  const cartItems = useCartStore((state) => state.items);

  // Sử dụng một Set chứa các seatId đã chọn để kiểm tra nhanh
  const selectedSeatIds = useMemo(() => {
    const seatIds = new Set<string>();
    Object.values(cartItems).forEach((item) => {
      if (item.type === "SEATED" && item.seat) {
        seatIds.add(item.seat.seatId);
      }
    });
    return seatIds;
  }, [cartItems]);

  const handleSeatClick = (seat: Seat, sectionId: string) => {
    console.log(seat);
    if (seat.status !== "available" && !selectedSeatIds.has(seat.seatId)) {
      toast.info(
        `Ghế ${seat.rowLabel}${seat.seatNumber} đã được bán hoặc đang được giữ.`
      );
      return;
    }

    if (!seat.ticketId) {
      toast.error("Ghế này không có thông tin vé hợp lệ.");
      return;
    }

    const parentSection = data.sections.find((s) => s.sectionId === sectionId);
    const fullTicketInfo = parentSection?.availableTickets.find(
      (t) => t.id === seat.ticketId
    );

    if (!fullTicketInfo) {
      toast.error(
        "Lỗi: Không tìm thấy thông tin chi tiết cho loại vé của ghế này."
      );
      return;
    }

    if (selectedSeatIds.has(seat.seatId)) {
      // Gọi đúng hàm `removeSeat`
      removeSeat(seat.seatId);
    } else {
      // Gọi đúng hàm `addSeat`
      addSeat(seat, fullTicketInfo);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedSeatIds.size === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế.");
      return;
    }
    router.push(`/checkout`);
  };

  const { totalPrice, selectedSeatDetails } = useMemo(() => {
    let total = 0;
    const details: { id: string; label: string }[] = [];

    Object.values(cartItems).forEach((item) => {
      if (
        item.type === "SEATED" &&
        item.seat &&
        selectedSeatIds.has(item.seat.seatId)
      ) {
        total += item.ticket.price;
        details.push({
          id: item.seat.seatId,
          label: `${item.seat.rowLabel}${item.seat.seatNumber}`,
        });
      }
    });
    details.sort((a, b) => a.label.localeCompare(b.label));

    return { totalPrice: total, selectedSeatDetails: details };
  }, [cartItems, selectedSeatIds]);

  const {
    svgRef,
    transform,
    zoomIn,
    zoomOut,
    resetTransform,
    panAndZoomHandlers,
  } = usePanAndZoom();
  const [vx, vy, vw, vh] = data.layoutData?.viewBox?.split(" ").map(Number) || [
    0, 0, 800, 600,
  ];

  return (
    <div className="p-4 border rounded-lg shadow-md flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">{data.seatMapName}</h3>
        <ZoomControls
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetTransform}
        />
      </div>
      <div className="w-full border rounded-md bg-gray-50 dark:bg-gray-900 overflow-hidden cursor-grab active:cursor-grabbing">
        <svg
          ref={svgRef}
          viewBox={`${vx} ${vy} ${vw} ${vh}`}
          className="w-full h-auto"
          {...panAndZoomHandlers}
        >
          <g transform={transform}>
            <StaticMapLayout
              layoutData={data.layoutData}
              sections={data.sections}
            />
            {data.sections.flatMap((section) =>
              section.seats.map((seat) => (
                <SeatComponent
                  key={seat.seatId}
                  seat={seat}
                  isSelected={selectedSeatIds.has(seat.seatId)}
                  onClick={() => handleSeatClick(seat, section.sectionId)}
                />
              ))
            )}
          </g>
        </svg>
      </div>
      <div className="mt-2 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-slate-50/50 dark:bg-gray-800/50 rounded-lg border">
        <div className="flex-grow">
          <p className="font-semibold">Ghế đã chọn:</p>
          <div className="flex flex-wrap gap-2 mt-1 text-sm">
            {selectedSeatDetails.length > 0 ? (
              selectedSeatDetails.map((seat) => (
                <span
                  key={seat.id}
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded"
                >
                  {seat.label}
                </span>
              ))
            ) : (
              <span className="text-gray-500">
                Vui lòng chọn ghế trên sơ đồ
              </span>
            )}
          </div>
        </div>
        <div className="text-center md:text-right shrink-0">
          <p>
            Số lượng:{" "}
            <span className="font-bold text-primary">
              {selectedSeatIds.size} ghế
            </span>
          </p>
          <p className="text-lg font-bold">
            Tổng cộng:{" "}
            <span className="text-primary">
              {totalPrice.toLocaleString()} VNĐ
            </span>
          </p>
        </div>
        <Button
          onClick={handleProceedToCheckout}
          disabled={selectedSeatIds.size === 0}
          size="lg"
          className="w-full md:w-auto"
        >
          Thanh toán ({selectedSeatIds.size} vé)
        </Button>
      </div>
    </div>
  );
};
export default ReservedSeatingSelector;

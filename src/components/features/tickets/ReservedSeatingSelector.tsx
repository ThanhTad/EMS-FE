// components/features/tickets/ReservedSeatingSelector.tsx
"use client";

import {
  ReservedSeatingData,
  Seat,
  TicketHoldRequest,
  TicketSelectionModeEnum,
} from "@/types";
import React, { useState, useMemo } from "react";
import { holdTicketsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { usePanAndZoom } from "@/hooks/usePanAndZoom";
import { useRouter } from "next/navigation";

// --- Sub-components for SVG rendering ---
const SeatComponent: React.FC<{
  seat: Seat;
  isSelected: boolean;
  onClick: (seat: Seat) => void;
}> = React.memo(({ seat, isSelected, onClick }) => {
  const { coordinates, status, rowLabel, seatNumber } = seat;
  if (!coordinates) return null;

  const fillColor = isSelected
    ? "#16a34a"
    : status === "available"
    ? "#60a5fa"
    : "#9ca3af";
  return (
    <circle
      cx={coordinates.x}
      cy={coordinates.y}
      r="8"
      fill={fillColor}
      onClick={() => status === "available" && onClick(seat)}
      className={`transition-all duration-150 ${
        status === "available"
          ? "cursor-pointer hover:stroke-black hover:stroke-2"
          : "cursor-not-allowed opacity-60"
      } ${isSelected ? "stroke-black stroke-2" : ""}`}
    >
      <title>{`Hàng: ${rowLabel}, Ghế: ${seatNumber} - ${status}`}</title>
    </circle>
  );
});
SeatComponent.displayName = "SeatComponent";

const SectionComponent: React.FC<{
  section: ReservedSeatingData["sections"][0];
}> = React.memo(({ section }) => {
  if (!section.layoutData?.svgPath) return null;
  return (
    <g>
      <path
        d={section.layoutData.svgPath}
        fill="rgba(0, 100, 255, 0.05)"
        stroke="rgba(0, 100, 255, 0.3)"
        strokeWidth="1"
        style={{ pointerEvents: "none" }}
      />
      {section.layoutData.labelPosition && (
        <text
          x={section.layoutData.labelPosition.x}
          y={section.layoutData.labelPosition.y}
          textAnchor="middle"
          alignmentBaseline="middle"
          className="text-xs font-bold fill-current text-gray-500"
          style={{ pointerEvents: "none" }}
        >
          {section.name}
        </text>
      )}
    </g>
  );
});
SectionComponent.displayName = "SectionComponent";

// --- Main Component ---
interface ReservedSeatingSelectorProps {
  data: ReservedSeatingData;
  eventId: string;
}

const ReservedSeatingSelector: React.FC<ReservedSeatingSelectorProps> = ({
  data,
  eventId,
}) => {
  const router = useRouter();
  // State vẫn giữ nguyên
  const [selectedSeats, setSelectedSeats] = useState<Map<string, Seat>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const {
    svgRef,
    transform,
    zoomIn,
    zoomOut,
    resetTransform,
    panAndZoomHandlers,
  } = usePanAndZoom();

  // THAY ĐỔI 2: Không cần `allAvailableTickets` hay `selectedTicketType` nữa
  // const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  // const allAvailableTickets = useMemo(...);

  const handleSeatClick = (seat: Seat) => {
    const newSelectedSeats = new Map(selectedSeats);
    if (newSelectedSeats.has(seat.seatId)) {
      newSelectedSeats.delete(seat.seatId);
    } else {
      // Có thể thêm giới hạn số lượng ghế được chọn ở đây
      // if (newSelectedSeats.size >= 10) {
      //   toast.error("Bạn chỉ có thể chọn tối đa 10 ghế.");
      //   return;
      // }
      newSelectedSeats.set(seat.seatId, seat);
    }
    setSelectedSeats(newSelectedSeats);
  };

  const handleHoldTickets = async () => {
    if (selectedSeats.size === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế.");
      return;
    }
    setIsLoading(true);

    try {
      // THAY ĐỔI 3: Chuẩn bị payload theo TicketHoldRequestDTO
      // Logic này không cần thiết nếu BE đã xử lý, giữ lại để tham khảo
      // const itemsByTicket = new Map<string, string[]>();
      // for (const seat of selectedSeats.values()) {
      //   const seats = itemsByTicket.get(seat.applicableTicketId) || [];
      //   seats.push(seat.seatId);
      //   itemsByTicket.set(seat.applicableTicketId, seats);
      // }
      // const gaItems = Array.from(itemsByTicket.entries()).map(([ticketId, seatIds]) => ({
      //   ticketId,
      //   quantity: seatIds.length,
      //   seatIds: seatIds, // có thể thêm seatIds vào đây nếu BE cần
      // }));

      const payload: TicketHoldRequest = {
        selectionMode: TicketSelectionModeEnum.RESERVED_SEATING,
        // gaItems bây giờ sẽ rỗng
        gaItems: [],
        // seatIds là danh sách tất cả các ID ghế đã chọn
        seatIds: Array.from(selectedSeats.keys()),
      };

      // Gọi API mới
      const response = await holdTicketsAPI(eventId, payload);

      toast.success(
        `Giữ thành công ${selectedSeats.size} ghế. Chuyển đến trang thanh toán...`
      );

      // Chuyển hướng đến trang thanh toán với holdId
      router.push(`/checkout?holdId=${response.holdId}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Vé đã được giữ hoặc không còn khả dụng.");
        const errorMessage =
          error.message || "Giữ vé thất bại. Vui lòng thử lại.";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // THAY ĐỔI 4: Tính tổng giá trực tiếp từ các ghế đã chọn
  const totalPrice = useMemo(() => {
    let total = 0;
    for (const seat of selectedSeats.values()) {
      total += seat.price || 0;
    }
    return total;
  }, [selectedSeats]);

  const viewBoxValues = data.layoutData?.viewBox?.split(" ").map(Number) || [
    0, 0, 1200, 800,
  ];
  const [vx, vy, vw, vh] = viewBoxValues;

  return (
    <div className="p-4 border rounded-lg shadow-md flex flex-col gap-4">
      {/* Phần header và SVG không đổi */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">{data.seatMapName}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetTransform}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="w-full border rounded-md bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing">
        <svg
          ref={svgRef}
          viewBox={`${vx} ${vy} ${vw} ${vh}`}
          className="w-full h-full"
          {...panAndZoomHandlers}
        >
          <g transform={transform}>
            {/* --- Nội dung SVG giữ nguyên như cũ --- */}
            {data.layoutData?.backgroundImageUrl && (
              <image
                href={data.layoutData.backgroundImageUrl}
                x={vx}
                y={vy}
                width={vw}
                height={vh}
              />
            )}
            {data.layoutData?.stage && (
              <rect
                x={data.layoutData.stage.x}
                y={data.layoutData.stage.y}
                width={data.layoutData.stage.width}
                height={data.layoutData.stage.height}
                fill="#333"
                rx="5"
              />
            )}
            {data.sections.map((section) => (
              <SectionComponent
                key={`section-shape-${section.sectionId}`}
                section={section}
              />
            ))}
            {data.sections.map((section) => (
              <g key={`section-seats-${section.sectionId}`}>
                {section.seats.map((seat) => (
                  <SeatComponent
                    key={seat.seatId}
                    seat={seat}
                    isSelected={selectedSeats.has(seat.seatId)}
                    onClick={handleSeatClick}
                  />
                ))}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* THAY ĐỔI 5: Giao diện thanh toán được đơn giản hóa */}
      <div className="mt-2 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-slate-50/50 rounded-lg border">
        {/* Không cần dropdown chọn loại vé nữa */}
        <div className="flex-grow">
          <p className="font-semibold">Ghế đã chọn:</p>
          <div className="flex flex-wrap gap-2 mt-1 text-sm">
            {selectedSeats.size > 0 ? (
              Array.from(selectedSeats.values()).map((seat) => (
                <span
                  key={seat.seatId}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {seat.rowLabel}
                  {seat.seatNumber}
                </span>
              ))
            ) : (
              <span className="text-gray-500">
                Vui lòng chọn ghế trên sơ đồ
              </span>
            )}
          </div>
        </div>

        <div className="text-center md:text-right">
          <p className="text-sm text-muted-foreground">
            Số lượng:{" "}
            <span className="font-bold text-primary">
              {selectedSeats.size} ghế
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
          onClick={handleHoldTickets}
          disabled={isLoading || selectedSeats.size === 0}
          size="lg"
          className="w-full md:w-auto"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Giữ vé
        </Button>
      </div>
    </div>
  );
};

export default ReservedSeatingSelector;

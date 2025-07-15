//components/features/tickets/ZonedAdmissionSelector.tsx
"use client";

import {
  ZonedAdmissionData,
  Zone,
  TicketType,
  TicketSelectionModeEnum,
  TicketHoldRequest,
  StageLayout,
} from "@/types";
import React, { useState, useMemo, useEffect } from "react";
import { holdTicketsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Users, ZoomIn, ZoomOut } from "lucide-react";
import { usePanAndZoom } from "@/hooks/usePanAndZoom";
import { useRouter } from "next/navigation";

// --- Sub-component for SVG rendering ---
interface StaticLayoutRendererProps {
  layoutData?: ZonedAdmissionData["layoutData"];
}

const StaticLayoutRenderer: React.FC<StaticLayoutRendererProps> = React.memo(
  ({ layoutData }) => {
    if (!layoutData) {
      return null;
    }

    const renderStage = (stage: StageLayout | undefined) => {
      if (!stage) return null;
      const x = Number(stage.x);
      const y = Number(stage.y);
      const width = Number(stage.width);
      const height = Number(stage.height);
      if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) return null;

      const label = stage.label || "SÂN KHẤU";
      const labelX = x + width / 2;
      const labelY = y + height / 2;

      return (
        <g key="stage" className="cursor-default">
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx="2"
            className="fill-gray-700 stroke-gray-900"
            strokeWidth="1"
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            alignmentBaseline="middle"
            className="text-xs font-bold fill-white pointer-events-none"
          >
            {label.toUpperCase()}
          </text>
        </g>
      );
    };

    return <>{renderStage(layoutData.stage)}</>;
  }
);
StaticLayoutRenderer.displayName = "StaticLayoutRenderer";

const ZoneComponent: React.FC<{
  zone: Zone;
  isSelected: boolean;
  onClick: (zone: Zone) => void;
}> = React.memo(({ zone, isSelected, onClick }) => {
  const { coordinates, status, name } = zone;
  if (!coordinates) return null;

  const fillColor =
    status === "AVAILABLE"
      ? isSelected
        ? "rgba(59, 130, 246, 0.5)"
        : "rgba(59, 130, 246, 0.2)"
      : "rgba(156, 163, 175, 0.4)";
  const strokeColor =
    status === "AVAILABLE" ? (isSelected ? "#2563eb" : "#93c5fd") : "#9ca3af";

  const renderShape = () => {
    // Xử lý cho hình PATH (an toàn hơn)
    if (
      coordinates.shape === "path" &&
      typeof coordinates.svgPath === "string"
    ) {
      return <path d={coordinates.svgPath} />;
    }

    // Xử lý cho hình RECT (AN TOÀN TUYỆT ĐỐI)
    if (coordinates.shape === "rect") {
      // Ép kiểu tường minh và kiểm tra
      const x = Number(coordinates.position?.x);
      const y = Number(coordinates.position?.y);
      const width = Number(coordinates.width);
      const height = Number(coordinates.height);

      // Kiểm tra xem tất cả có phải là số hợp lệ không
      if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
        return <rect x={x} y={y} width={width} height={height} rx="5" />;
      }
    }

    return null;
  };

  return (
    <g
      onClick={() => status === "AVAILABLE" && onClick(zone)}
      className={
        status === "AVAILABLE" ? "cursor-pointer" : "cursor-not-allowed"
      }
    >
      <g
        className="transition-all duration-200"
        style={{
          transform: isSelected ? "scale(1.02)" : "scale(1)",
          transformOrigin: "center center",
        }}
      >
        {renderShape()}
      </g>
      {coordinates.labelPosition && (
        <text
          x={Number(coordinates.labelPosition.x)}
          y={Number(coordinates.labelPosition.y)}
          textAnchor="middle"
          alignmentBaseline="middle"
          className="text-sm font-bold fill-current text-gray-800"
          style={{ pointerEvents: "none" }}
        >
          {name}
        </text>
      )}
      <style jsx>{`
        g > g > * {
          fill: ${fillColor};
          stroke: ${strokeColor};
          stroke-width: ${isSelected ? 2.5 : 1.5};
        }
      `}</style>
    </g>
  );
});
ZoneComponent.displayName = "ZoneComponent";

// --- Main Component ---
interface ZonedAdmissionSelectorProps {
  data: ZonedAdmissionData;
  eventId: string;
}

const ZonedAdmissionSelector: React.FC<ZonedAdmissionSelectorProps> = ({
  data,
  eventId,
}) => {
  const router = useRouter();

  // State giữ nguyên như component ban đầu của bạn
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const {
    svgRef,
    transform,
    zoomIn,
    zoomOut,
    resetTransform,
    panAndZoomHandlers,
  } = usePanAndZoom();

  // Khi người dùng click vào một zone mới, reset lại các lựa chọn cũ
  const handleZoneClick = (zone: Zone) => {
    // Nếu click lại zone cũ thì không làm gì cả
    if (selectedZone?.zoneId === zone.zoneId) return;

    setSelectedZone(zone);
    // Reset lại lựa chọn vé và số lượng
    setSelectedTicket(null);
    setQuantity(1);
  };

  // Tự động chọn vé đầu tiên khi một zone được chọn, nếu zone đó chỉ có 1 loại vé
  useEffect(() => {
    if (selectedZone && selectedZone.availableTickets.length === 1) {
      setSelectedTicket(selectedZone.availableTickets[0]);
    }
  }, [selectedZone]);

  const handleHoldTickets = async () => {
    if (!selectedZone || !selectedTicket || quantity <= 0) {
      toast.error("Vui lòng chọn khu vực, loại vé và số lượng.");
      return;
    }

    // Kiểm tra số lượng lần cuối trước khi gửi đi
    const maxQuantity = Math.min(
      selectedTicket.maxPerPurchase || 10,
      selectedZone.availableCapacity
    );
    if (quantity > maxQuantity) {
      toast.error(
        `Số lượng vé vượt quá giới hạn cho phép (${maxQuantity} vé).`
      );
      return;
    }

    setIsLoading(true);
    try {
      // THAY ĐỔI 2: Chuẩn bị payload theo TicketHoldRequestDTO
      const payload: TicketHoldRequest = {
        selectionMode: TicketSelectionModeEnum.ZONED_ADMISSION,
        gaItems: [
          {
            ticketId: selectedTicket.ticketId,
            quantity: quantity,
          },
        ],
        seatIds: [], // Luôn là mảng rỗng
      };

      // Gọi API mới
      const response = await holdTicketsAPI(eventId, payload);

      toast.success(
        `Giữ thành công ${quantity} vé tại khu vực "${selectedZone.name}". Đang chuyển đến trang thanh toán...`
      );

      // Chuyển hướng đến trang thanh toán
      router.push(`/checkout?holdId=${response.holdId}`);
    } catch (error) {
      if (error instanceof Error) {
        const msg =
          error.message || "Giữ vé thất bại. Vé có thể đã được bán hết.";
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const maxQuantity = useMemo(() => {
    if (!selectedZone || !selectedTicket) return 1;
    return Math.min(
      selectedTicket.maxPerPurchase || 10,
      selectedZone.availableCapacity
    );
  }, [selectedZone, selectedTicket]);

  const viewBoxValues = data.layoutData?.viewBox?.split(" ").map(Number) || [
    0, 0, 1200, 800,
  ];
  const [vx, vy, vw, vh] = viewBoxValues;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 p-4 border rounded-lg shadow-md">
        {/* Phần header và SVG không đổi */}
        <div className="flex justify-between items-center mb-4">
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
        <div className="w-full flex-1 border rounded-md bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing">
          <svg
            ref={svgRef}
            viewBox={`${vx} ${vy} ${vw} ${vh}`}
            className="w-full h-full"
            {...panAndZoomHandlers}
          >
            <g transform={transform}>
              <StaticLayoutRenderer layoutData={data.layoutData} />
              {data.layoutData?.backgroundImageUrl && (
                <image
                  href={data.layoutData.backgroundImageUrl}
                  x={vx}
                  y={vy}
                  width={vw}
                  height={vh}
                />
              )}
              {data.zones.map((zone) => (
                <ZoneComponent
                  key={zone.zoneId}
                  zone={zone}
                  isSelected={selectedZone?.zoneId === zone.zoneId}
                  onClick={handleZoneClick}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>

      <div className="md:col-span-1 p-4 border rounded-lg shadow-md bg-slate-50 flex flex-col">
        {/* Phần panel chọn vé không đổi, logic vẫn đúng */}
        <h3 className="text-lg font-bold mb-4 border-b pb-2">Chọn vé</h3>
        {!selectedZone ? (
          <div className="flex-grow flex items-center justify-center text-center text-muted-foreground">
            <p>Vui lòng chọn một khu vực trên sơ đồ.</p>
          </div>
        ) : (
          <div className="flex-grow space-y-4 flex flex-col">
            <div>
              <h4 className="font-semibold text-lg text-primary">
                {selectedZone.name}
              </h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Users size={14} />
                Còn lại: {selectedZone.availableCapacity} /{" "}
                {selectedZone.capacity} vé
              </p>
            </div>
            <div>
              <label
                htmlFor="ticket-type-zoned"
                className="block text-sm font-medium text-gray-700"
              >
                Loại vé
              </label>
              <select
                id="ticket-type-zoned"
                value={selectedTicket?.ticketId || ""}
                onChange={(e) => {
                  setQuantity(1); // Reset số lượng khi đổi loại vé
                  setSelectedTicket(
                    selectedZone.availableTickets.find(
                      (t) => t.ticketId === e.target.value
                    ) || null
                  );
                }}
                className="mt-1 block w-full p-2 border-gray-300 rounded-md"
              >
                <option value="">-- Chọn loại vé --</option>
                {selectedZone.availableTickets.map((t) => (
                  <option
                    key={t.ticketId}
                    value={t.ticketId}
                    disabled={!t.isOnSale}
                  >
                    {t.name} - {t.price.toLocaleString()} VNĐ
                  </option>
                ))}
              </select>
            </div>
            {selectedTicket && (
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Số lượng
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(maxQuantity, parseInt(e.target.value, 10) || 1)
                      )
                    )
                  }
                  min="1"
                  max={maxQuantity}
                  className="mt-1 block w-full p-2 border-gray-300 rounded-md"
                />
              </div>
            )}
            <div className="border-t pt-4 mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Tổng tiền:</span>
                <span className="text-xl font-bold text-primary">
                  {(selectedTicket
                    ? selectedTicket.price * quantity
                    : 0
                  ).toLocaleString()}{" "}
                  VNĐ
                </span>
              </div>
              <Button
                onClick={handleHoldTickets}
                disabled={isLoading || !selectedTicket || quantity <= 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Giữ vé"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZonedAdmissionSelector;

// components/features/tickets/ZonedAdmissionSelector.tsx
"use client";

import { ZonedAdmissionData, Zone, Ticket } from "@/types";
import React, { useState, useMemo, FC } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Users } from "lucide-react";
import { usePanAndZoom } from "@/hooks/usePanAndZoom";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { ZoomControls } from "@/components/shared/ZoomControls";
import { StaticMapLayout } from "@/components/shared/StaticMapLayout";

// =======================================================
// ================= SUB-COMPONENTS ======================
// =======================================================

/**
 * Component con, chịu trách nhiệm cho MỘT loại vé duy nhất trong panel.
 * Nó tự kết nối với cartStore và hiển thị số lượng vé còn lại.
 */
const ZoneTicketControl: FC<{ ticket: Ticket }> = ({ ticket }) => {
  const updateGaQuantity = useCartStore((state) => state.updateGaQuantity);
  const items = useCartStore((state) => state.items);

  const quantityInCart = useMemo(() => {
    const item = items[ticket.id];
    return item && item.type === "GA" ? item.quantity : 0;
  }, [items, ticket.id]);

  const handleQuantityChange = (newQuantity: number) => {
    updateGaQuantity(ticket, newQuantity);
  };

  const availableQuantity = ticket.availableQuantity ?? Infinity;
  const maxPurchase = Math.min(ticket.maxPerPurchase || 10, availableQuantity);

  return (
    <div
      className={`border-t pt-4 ${availableQuantity === 0 ? "opacity-60" : ""}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{ticket.name}</p>
          <p className="font-semibold text-primary">
            {ticket.price.toLocaleString()} VNĐ
          </p>
        </div>

        {/* === HIỂN THỊ SỐ LƯỢNG VÉ CÒN LẠI === */}
        {ticket.availableQuantity != null && ticket.availableQuantity > 0 && (
          <div className="text-right text-xs shrink-0 ml-2">
            <span
              className={`font-semibold ${
                ticket.availableQuantity <= 20
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              Còn lại: {ticket.availableQuantity}
            </span>
          </div>
        )}

        {ticket.availableQuantity === 0 && (
          <div className="text-right text-xs shrink-0 ml-2">
            <span className="font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
              Hết vé
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(quantityInCart - 1)}
          disabled={quantityInCart === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="font-bold text-lg w-12 text-center">
          {quantityInCart}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            handleQuantityChange(Math.min(maxPurchase, quantityInCart + 1))
          }
          disabled={quantityInCart >= maxPurchase || availableQuantity === 0}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

/**
 * Component con cho Zone trên bản đồ SVG (giữ nguyên)
 */
const ZoneComponent: FC<{
  zone: Zone;
  isSelected: boolean;
  onClick: () => void;
}> = React.memo(({ zone, isSelected, onClick }) => {
  const { layoutData, status, name } = zone;
  if (!layoutData?.svgPath) return null;
  const isAvailable = status === "AVAILABLE" && zone.availableCapacity > 0;
  const fillColor = isAvailable
    ? isSelected
      ? "hsla(221, 83%, 53%, 0.5)"
      : "hsla(221, 83%, 53%, 0.2)"
    : "hsla(215, 14%, 34%, 0.4)";
  const strokeColor = isAvailable
    ? isSelected
      ? "hsl(221, 83%, 53%)"
      : "hsl(221, 83%, 80%)"
    : "hsl(215, 20%, 65%)";
  return (
    <g
      onClick={() => isAvailable && onClick()}
      className={isAvailable ? "cursor-pointer group" : "cursor-not-allowed"}
    >
      <path
        d={layoutData.svgPath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        className="transition-all duration-200 group-hover:fill-[hsla(221,83%,53%,0.3)]"
      />
      {layoutData.labelPosition && (
        <text
          x={layoutData.labelPosition.x}
          y={layoutData.labelPosition.y}
          textAnchor="middle"
          alignmentBaseline="middle"
          className="text-sm font-bold fill-gray-800 pointer-events-none"
        >
          {name}
        </text>
      )}
    </g>
  );
});
ZoneComponent.displayName = "ZoneComponent";

// =======================================================
// ================= MAIN COMPONENT ======================
// =======================================================

interface ZonedAdmissionSelectorProps {
  data: ZonedAdmissionData;
}

const ZonedAdmissionSelector: FC<ZonedAdmissionSelectorProps> = ({ data }) => {
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const cartItems = useCartStore((state) => state.items);

  const totalItemsInCart = useMemo(
    () =>
      Object.values(cartItems).reduce(
        (sum, item) => sum + (item.type === "GA" ? item.quantity : 0),
        0
      ),
    [cartItems]
  );
  const totalPriceInCart = useMemo(
    () =>
      Object.values(cartItems).reduce(
        (sum, item) =>
          sum + item.ticket.price * (item.type === "GA" ? item.quantity : 1),
        0
      ),
    [cartItems]
  );

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const handleProceedToCheckout = () => {
    if (totalItemsInCart === 0) {
      toast.error("Vui lòng chọn ít nhất một vé.");
      return;
    }
    router.push("/checkout");
  };

  const {
    svgRef,
    transform,
    zoomIn,
    zoomOut,
    resetTransform,
    panAndZoomHandlers,
  } = usePanAndZoom();
  const [vx, vy, vw, vh] = data.layoutData?.viewBox?.split(" ").map(Number) || [
    0, 0, 1200, 800,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 p-4 border rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{data.seatMapName}</h3>
          <ZoomControls
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetTransform}
          />
        </div>
        <div className="w-full flex-1 border rounded-md bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing">
          <svg
            ref={svgRef}
            viewBox={`${vx} ${vy} ${vw} ${vh}`}
            className="w-full h-full"
            {...panAndZoomHandlers}
          >
            <g transform={transform}>
              <StaticMapLayout
                layoutData={data.layoutData}
                sections={data.zones.map((z) => ({
                  ...z,
                  sectionId: z.zoneId,
                  seats: [],
                }))}
              />
              {data.zones.map((zone) => (
                <ZoneComponent
                  key={zone.zoneId}
                  zone={zone}
                  isSelected={selectedZone?.zoneId === zone.zoneId}
                  onClick={() => handleZoneClick(zone)}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>

      <div className="md:col-span-1 p-4 border rounded-lg shadow-md bg-slate-50 flex flex-col">
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
                <Users size={14} /> Còn lại: {selectedZone.availableCapacity} /{" "}
                {selectedZone.capacity} vé
              </p>
            </div>

            {selectedZone.availableTickets.map((ticket) => (
              <ZoneTicketControl
                key={`${selectedZone.zoneId}-${ticket.id}`}
                ticket={ticket}
              />
            ))}
          </div>
        )}

        {totalItemsInCart > 0 && (
          <div className="border-t pt-4 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-bold">Tổng giỏ hàng</p>
                <p className="text-xs text-muted-foreground">
                  {totalItemsInCart} vé từ các khu vực
                </p>
              </div>
              <span className="text-xl font-bold text-primary">
                {totalPriceInCart.toLocaleString()} VNĐ
              </span>
            </div>
            <Button
              onClick={handleProceedToCheckout}
              className="w-full"
              size="lg"
            >
              Thanh toán
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZonedAdmissionSelector;

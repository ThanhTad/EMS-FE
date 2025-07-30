"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DesignerSectionData,
  SeatMapDetails,
  SeatGenerationConfig,
  UpdateSeatMapRequest,
  SectionLayoutData,
  SeatMapDesignerProps,
  DesignerSeatData,
  Seat,
} from "@/types";
import { DesignerToolbar } from "./designer/DesignerToolbar";
import { DesignerCanvas } from "./designer/DesignerCanvas";
import { PropertiesPanel } from "./designer/PropertiesPanel";
import { useDesignerStore } from "@/hooks/useDesignerStore";
import { BulkActionsToolbar } from "./designer/BulkActionsToolbar";

const getDefaultLayoutData = (): SectionLayoutData => ({
  svgPath: "M 0 0 L 100 0 L 100 100 L 0 100 Z", // Một hình vuông mặc định
  style: {
    default: { fill: "#e0e0e0", stroke: "#a0a0a0", strokeWidth: 1 },
    hover: { fill: "#c0c0c0" },
    selected: { stroke: "#3b82f6", strokeWidth: 2 },
  },
});

// Hàm helper để chuyển đổi dữ liệu từ API
const transformApiDataToState = (
  apiData: SeatMapDetails
): DesignerSectionData[] => {
  return apiData.sections.map((section) => ({
    id: section.id,
    name: section.name,
    capacity: section.capacity,
    layoutData: section.layoutData || getDefaultLayoutData(),
    seats: section.seats.map((seat: Seat) => ({
      id: seat.seatId,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType || "standard",
      coordinates: seat.coordinates || { x: 0, y: 0 },
    })),
  }));
};

export default function SeatMapDesigner({
  isEditMode,
  initialData,
  onSave,
}: SeatMapDesignerProps) {
  const router = useRouter();
  const { selectedObjectIds, setSelectedObjects } = useDesignerStore();

  const [mapName, setMapName] = useState(initialData.name);
  const [mapDescription, setMapDescription] = useState(
    initialData.description || ""
  );
  const [sections, setSections] = useState<DesignerSectionData[]>(
    transformApiDataToState(initialData)
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSection = useCallback(
    (newSection: Omit<DesignerSectionData, "id">) => {
      setSections((prev) => [
        ...prev,
        { ...newSection, id: `temp-${Date.now()}` },
      ]);
    },
    []
  );

  const handleUpdateSection = useCallback(
    (id: string, updates: Partial<DesignerSectionData>) => {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const handleGenerateSeats = useCallback(
    (sectionId: string, config: SeatGenerationConfig) => {
      const {
        rows,
        cols,
        startRow,
        startCol,
        hSpacing,
        vSpacing,
        seatType,
        rowLabelType,
      } = config;
      const newSeats = [];
      const getRowLabel = (rowIndex: number) => {
        if (rowLabelType === "alpha") {
          return String.fromCharCode(startRow.charCodeAt(0) + rowIndex);
        }
        return (Number(startRow) + rowIndex).toString();
      };

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          newSeats.push({
            id: `temp-seat-${Date.now()}-${i}-${j}`,
            rowLabel: getRowLabel(i),
            seatNumber: (startCol + j).toString(),
            seatType: seatType,
            coordinates: { x: j * hSpacing, y: i * vSpacing },
          });
        }
      }
      handleUpdateSection(sectionId, {
        seats: newSeats,
        capacity: newSeats.length,
      });
      toast.success(`Đã tạo ${newSeats.length} ghế!`);
    },
    [handleUpdateSection]
  );

  const handleSaveClick = async () => {
    setIsLoading(true);
    try {
      const payload: UpdateSeatMapRequest = {
        name: mapName,
        description: mapDescription,
        layoutData: initialData.layoutData,
        sections: sections.map((s) => ({
          id: s.id.startsWith("temp-") ? undefined : s.id,
          name: s.name,
          capacity: s.capacity,
          layoutData: s.layoutData,
          seats: s.seats.map((seat) => ({
            id: seat.id.startsWith("temp-") ? undefined : seat.id,
            rowLabel: seat.rowLabel,
            seatNumber: seat.seatNumber,
            seatType: seat.seatType,
            coordinates: seat.coordinates,
          })),
        })),
      };
      await onSave(payload);
    } catch (error) {
      toast.error("Lỗi lưu sơ đồ", {
        description:
          error instanceof Error ? error.message : "Lỗi không xác định",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMultipleSeats = useCallback(
    (seatIds: string[], updates: Partial<DesignerSeatData>) => {
      const idSet = new Set(seatIds);
      setSections((prevSections) =>
        prevSections.map((section) => ({
          ...section,
          seats: section.seats.map((seat) =>
            idSet.has(seat.id) ? { ...seat, ...updates } : seat
          ),
        }))
      );
    },
    []
  );

  const handleUpdateSeat = useCallback(
    (sectionId: string, seatId: string, updates: Partial<DesignerSeatData>) => {
      // Chúng ta có thể bỏ qua sectionId ở đây vì seatId đã là duy nhất
      handleUpdateMultipleSeats([seatId], updates);
    },
    [handleUpdateMultipleSeats]
  );

  const getSelectedSeats = useCallback((): DesignerSeatData[] => {
    const selectedSeatsMap = new Map<string, DesignerSeatData>();
    const idSet = new Set(selectedObjectIds);
    sections.forEach((sec) => {
      sec.seats.forEach((seat) => {
        if (idSet.has(seat.id)) {
          selectedSeatsMap.set(seat.id, seat);
        }
      });
    });
    return Array.from(selectedSeatsMap.values());
  }, [selectedObjectIds, sections]);

  const handleDistribute = (direction: "horizontal" | "vertical") => {
    const selectedSeats = getSelectedSeats();
    if (selectedSeats.length < 3)
      return toast.info("Cần chọn ít nhất 3 ghế để phân phối.");

    const axis = direction === "horizontal" ? "x" : "y";
    const sortedSeats = [...selectedSeats].sort(
      (a, b) => a.coordinates[axis] - b.coordinates[axis]
    );

    const firstSeat = sortedSeats[0];
    const lastSeat = sortedSeats[sortedSeats.length - 1];

    const totalDistance =
      lastSeat.coordinates[axis] - firstSeat.coordinates[axis];
    if (totalDistance === 0) return;

    const spacing = totalDistance / (sortedSeats.length - 1);

    const updatesMap = new Map<string, Partial<DesignerSeatData>>();
    sortedSeats.forEach((seat, index) => {
      const newCoord = firstSeat.coordinates[axis] + index * spacing;
      updatesMap.set(seat.id, {
        coordinates: { ...seat.coordinates, [axis]: newCoord },
      });
    });

    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        seats: sec.seats.map((seat) =>
          updatesMap.has(seat.id)
            ? { ...seat, ...updatesMap.get(seat.id) }
            : seat
        ),
      }))
    );
  };

  const handleAlign = (
    type: "left" | "center-h" | "right" | "top" | "center-v" | "bottom"
  ) => {
    const selectedSeats = getSelectedSeats();
    if (selectedSeats.length < 2) return;

    const xs = selectedSeats.map((s) => s.coordinates.x);
    const ys = selectedSeats.map((s) => s.coordinates.y);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const centerX = (minX + maxX) / 2,
      centerY = (minY + maxY) / 2;

    const updatesMap = new Map<string, Partial<DesignerSeatData>>();
    selectedSeats.forEach((seat) => {
      const newCoords = { ...seat.coordinates };
      switch (type) {
        case "left":
          newCoords.x = minX;
          break;
        case "center-h":
          newCoords.x = centerX;
          break;
        case "right":
          newCoords.x = maxX;
          break;
        case "top":
          newCoords.y = minY;
          break;
        case "center-v":
          newCoords.y = centerY;
          break;
        case "bottom":
          newCoords.y = maxY;
          break;
      }
      updatesMap.set(seat.id, { coordinates: newCoords });
    });

    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        seats: sec.seats.map((seat) =>
          updatesMap.has(seat.id)
            ? { ...seat, ...updatesMap.get(seat.id) }
            : seat
        ),
      }))
    );
  };

  const handleRotateSelected = (angleDegrees: number) => {
    const selectedSeats = getSelectedSeats();
    if (selectedSeats.length < 1) {
      toast.info("Vui lòng chọn ít nhất một ghế để xoay.");
      return;
    }

    // 1. Tìm điểm trung tâm (centroid) của nhóm ghế đã chọn
    const sumX = selectedSeats.reduce(
      (acc, seat) => acc + seat.coordinates.x,
      0
    );
    const sumY = selectedSeats.reduce(
      (acc, seat) => acc + seat.coordinates.y,
      0
    );
    const centerX = sumX / selectedSeats.length;
    const centerY = sumY / selectedSeats.length;

    // 2. Chuyển đổi góc từ độ sang radian
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const cosTheta = Math.cos(angleRadians);
    const sinTheta = Math.sin(angleRadians);

    // 3. Tạo một map chứa các tọa độ mới để cập nhật
    const updatesMap = new Map<string, Partial<DesignerSeatData>>();

    selectedSeats.forEach((seat) => {
      // Tọa độ của ghế so với điểm trung tâm
      const dx = seat.coordinates.x - centerX;
      const dy = seat.coordinates.y - centerY;

      // Áp dụng công thức xoay
      const newX = dx * cosTheta - dy * sinTheta + centerX;
      const newY = dx * sinTheta + dy * cosTheta + centerY;

      updatesMap.set(seat.id, {
        coordinates: {
          x: Math.round(newX * 100) / 100, // Làm tròn 2 chữ số thập phân
          y: Math.round(newY * 100) / 100,
        },
      });
    });

    // 4. Cập nhật state một cách bất biến
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        seats: section.seats.map((seat) => {
          if (updatesMap.has(seat.id)) {
            return { ...seat, ...updatesMap.get(seat.id) };
          }
          return seat;
        }),
      }))
    );
  };

  const handleRenumberSeat = useCallback(
    (seatId: string, newSeatNumber: string) => {
      setSections((prev) =>
        prev.map((sec) => ({
          ...sec,
          seats: sec.seats.map((seat) =>
            seat.id === seatId ? { ...seat, seatNumber: newSeatNumber } : seat
          ),
        }))
      );
    },
    []
  );

  const handleDeleteSelected = () => {
    if (selectedObjectIds.length === 0) return;
    const idSet = new Set(selectedObjectIds);
    setSections(
      (prev) =>
        prev
          .map((section) => {
            if (idSet.has(section.id)) return null;
            return {
              ...section,
              seats: section.seats.filter((seat) => !idSet.has(seat.id)),
            };
          })
          .filter(Boolean) as DesignerSectionData[]
    );
    setSelectedObjects([], "none");
    toast.success("Đã xóa các đối tượng được chọn.");
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans">
      <DesignerToolbar
        mapName={mapName}
        setMapName={setMapName}
        mapDescription={mapDescription}
        setMapDescription={setMapDescription}
        isEditMode={isEditMode}
        onSave={handleSaveClick}
        isLoading={isLoading}
        onBack={() => router.back()}
      />
      <main className="flex-1 overflow-hidden relative">
        {/* THÊM VÀO ĐÂY */}
        <BulkActionsToolbar
          onDistributeHorizontal={() => handleDistribute("horizontal")}
          onDistributeVertical={() => handleDistribute("vertical")}
          onRotate={handleRotateSelected}
          onAlign={handleAlign}
          onDeleteSelected={handleDeleteSelected}
        />
        <DesignerCanvas
          sections={sections}
          onAddSection={handleAddSection}
          onUpdateSection={handleUpdateSection}
          onUpdateSeat={handleUpdateSeat}
        />
      </main>
      <PropertiesPanel
        sections={sections}
        onUpdateSection={handleUpdateSection}
        onGenerateSeats={handleGenerateSeats}
        onUpdateMultipleSeats={handleUpdateMultipleSeats}
        onRenumber={handleRenumberSeat}
      />
    </div>
  );
}

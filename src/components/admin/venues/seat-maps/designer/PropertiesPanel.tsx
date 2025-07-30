"use client";
import { useDesignerStore } from "@/hooks/useDesignerStore";
import {
  DesignerSectionData,
  DesignerSeatData,
  SeatGenerationConfig,
} from "@/types";
import { SectionProperties } from "./SectionProperties";
import { SeatBulkProperties } from "./SeatBulkProperties";

interface PropertiesPanelProps {
  sections: DesignerSectionData[];
  onUpdateSection: (id: string, updates: Partial<DesignerSectionData>) => void;
  onUpdateMultipleSeats: (
    seatIds: string[],
    updates: Partial<DesignerSeatData>
  ) => void; // Cần hàm này
  onGenerateSeats: (sectionId: string, config: SeatGenerationConfig) => void;
  onRenumber: (seatId: string, newSeatNumber: string) => void;
}

// Hàm helper để tìm tất cả các đối tượng được chọn
const findSelectedObjects = (
  sections: DesignerSectionData[],
  selectedIds: string[]
) => {
  const selectedSections: DesignerSectionData[] = [];
  const selectedSeats: DesignerSeatData[] = [];
  const idSet = new Set(selectedIds);

  sections.forEach((section) => {
    if (idSet.has(section.id)) {
      selectedSections.push(section);
    }
    section.seats.forEach((seat) => {
      if (idSet.has(seat.id)) {
        selectedSeats.push(seat);
      }
    });
  });
  return { selectedSections, selectedSeats };
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  sections,
  onUpdateSection,
  onUpdateMultipleSeats,
  onGenerateSeats,
  onRenumber,
}) => {
  const { selectedObjectIds, selectedObjectType } = useDesignerStore();

  const { selectedSections, selectedSeats } = findSelectedObjects(
    sections,
    selectedObjectIds
  );

  const renderContent = () => {
    switch (selectedObjectType) {
      case "none":
        return (
          <p className="text-sm text-gray-500 mt-2">
            Chọn một đối tượng để chỉnh sửa.
          </p>
        );

      case "mixed":
        return (
          <p className="text-sm text-gray-500 mt-2">
            {selectedObjectIds.length} đối tượng đã được chọn. Vui lòng chỉ chọn
            một loại (khu vực hoặc ghế) để sửa hàng loạt.
          </p>
        );

      case "section":
        if (selectedSections.length === 1) {
          // Hiển thị thuộc tính chi tiết cho MỘT section
          return (
            <SectionProperties
              section={selectedSections[0]}
              onUpdate={onUpdateSection}
              onGenerateSeats={onGenerateSeats}
            />
          );
        } else {
          // TODO: Giao diện sửa nhiều section cùng lúc (ví dụ: đổi màu chung)
          return (
            <p className="text-sm text-gray-500 mt-2">
              {selectedSections.length} khu vực đã được chọn.
            </p>
          );
        }

      case "seat":
        // Hiển thị form sửa thuộc tính cho MỘT hoặc NHIỀU ghế
        return (
          <SeatBulkProperties
            selectedSeats={selectedSeats}
            onUpdate={onUpdateMultipleSeats}
            onRenumber={onRenumber}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg border-l h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Thuộc tính</h3>
      </div>
      <div className="flex-grow overflow-y-auto p-4">{renderContent()}</div>
    </div>
  );
};

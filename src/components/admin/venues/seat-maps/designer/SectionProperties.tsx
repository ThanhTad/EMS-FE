"use client";
import { DesignerSectionData, SeatGenerationConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeatGenerator } from "./SeatGenerator";

interface SectionPropertiesProps {
  section: DesignerSectionData;
  onUpdate: (id: string, updates: Partial<DesignerSectionData>) => void;
  onGenerateSeats: (sectionId: string, config: SeatGenerationConfig) => void;
}

export const SectionProperties: React.FC<SectionPropertiesProps> = ({
  section,
  onUpdate,
  onGenerateSeats,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Tên Khu vực</Label>
        <Input
          value={section.name}
          onChange={(e) => onUpdate(section.id, { name: e.target.value })}
        />
      </div>
      <div>
        <Label>Sức chứa (Capacity)</Label>
        <Input
          type="number"
          value={section.capacity}
          onChange={(e) =>
            onUpdate(section.id, { capacity: Number(e.target.value) || 0 })
          }
        />
        <p className="text-xs text-muted-foreground mt-1">
          Dùng cho vé Zone. Sẽ tự cập nhật nếu tạo ghế.
        </p>
      </div>
      <SeatGenerator
        onGenerate={(config) => onGenerateSeats(section.id, config)}
      />
    </div>
  );
};

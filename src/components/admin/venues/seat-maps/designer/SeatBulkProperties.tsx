"use client";
import { DesignerSeatData } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useBulkProperty } from "@/hooks/useBulkProperty";
import { SeatNumberBulkEditor } from "./SeatNumberBulkEditor";

interface SeatBulkPropertiesProps {
  selectedSeats: DesignerSeatData[];
  onUpdate: (seatIds: string[], updates: Partial<DesignerSeatData>) => void;
  onRenumber: (seatId: string, newSeatNumber: string) => void;
}

export const SeatBulkProperties: React.FC<SeatBulkPropertiesProps> = ({
  selectedSeats,
  onUpdate,
  onRenumber,
}) => {
  // Sử dụng custom hook cho mỗi thuộc tính bạn muốn sửa hàng loạt
  const seatTypeProps = useBulkProperty(selectedSeats, "seatType", onUpdate);
  const rowLabelProps = useBulkProperty(selectedSeats, "rowLabel", onUpdate);

  if (selectedSeats.length === 0) {
    // Trường hợp này nên được xử lý ở component cha, nhưng để đây cho an toàn
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium">Thuộc tính Ghế</h4>
        <p className="text-sm text-muted-foreground">
          {selectedSeats.length} ghế đã được chọn. Mọi thay đổi sẽ được áp dụng
          cho tất cả.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        {/* Trường Row Label */}
        <div>
          <Label htmlFor="bulk-rowLabel">Nhãn hàng (Row Label)</Label>
          <Input
            id="bulk-rowLabel"
            value={rowLabelProps.value}
            onChange={rowLabelProps.onChange}
            placeholder={rowLabelProps.placeholder}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ví dụ: A, B, C... hoặc 1, 2, 3...
          </p>
        </div>

        {/* Trường Seat Type */}
        <div>
          <Label htmlFor="bulk-seatType">Loại ghế (Seat Type)</Label>
          <Input
            id="bulk-seatType"
            value={seatTypeProps.value}
            onChange={seatTypeProps.onChange}
            placeholder={seatTypeProps.placeholder}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ví dụ: standard, vip, wheelchair, couple...
          </p>
        </div>
      </div>
      <SeatNumberBulkEditor
        selectedSeats={selectedSeats}
        onRenumber={onRenumber}
      />
    </div>
  );
};

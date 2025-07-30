"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DesignerSeatData } from "@/types";
import { toast } from "sonner";

const seatNumberEditorSchema = z.object({
  prefix: z.string().optional(),
  startNumber: z.coerce.number().int().min(1, "Bắt đầu từ 1"),
  suffix: z.string().optional(),
});

type SeatNumberEditorValues = z.infer<typeof seatNumberEditorSchema>;

interface SeatNumberBulkEditorProps {
  selectedSeats: DesignerSeatData[];
  onRenumber: (seatId: string, newSeatNumber: string) => void;
}

export const SeatNumberBulkEditor: React.FC<SeatNumberBulkEditorProps> = ({
  selectedSeats,
  onRenumber,
}) => {
  const { register, handleSubmit } = useForm<SeatNumberEditorValues>({
    resolver: zodResolver(seatNumberEditorSchema),
    defaultValues: { prefix: "", startNumber: 1, suffix: "" },
  });

  const handleFormSubmit = (data: SeatNumberEditorValues) => {
    // Sắp xếp các ghế theo vị trí từ trái sang phải để đánh số đúng thứ tự
    const sortedSeats = [...selectedSeats].sort(
      (a, b) => a.coordinates.x - b.coordinates.x
    );

    sortedSeats.forEach((seat, index) => {
      const newSeatNumber = `${data.prefix || ""}${data.startNumber + index}${
        data.suffix || ""
      }`;
      onRenumber(seat.id, newSeatNumber);
    });

    toast.success(`Đã đánh số lại ${sortedSeats.length} ghế.`);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-3 pt-4 border-t"
    >
      <h4 className="font-medium">Đánh số lại ghế</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tiền tố</Label>
          <Input {...register("prefix")} placeholder="ví dụ: V-" />
        </div>
        <div>
          <Label>Số bắt đầu</Label>
          <Input {...register("startNumber")} type="number" />
        </div>
      </div>
      <div>
        <Label>Hậu tố</Label>
        <Input {...register("suffix")} placeholder="ví dụ: A" />
      </div>
      <Button type="submit" className="w-full" size="sm">
        Áp dụng
      </Button>
    </form>
  );
};

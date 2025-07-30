"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SeatGenerationConfig } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";

// Zod schema để validation
const seatGeneratorSchema = z
  .object({
    rows: z.coerce
      .number()
      .int()
      .min(1, "Ít nhất 1 hàng")
      .max(100, "Tối đa 100 hàng"),
    cols: z.coerce
      .number()
      .int()
      .min(1, "Ít nhất 1 ghế")
      .max(100, "Tối đa 100 ghế/hàng"),
    rowLabelType: z.enum(["alpha", "numeric"], {
      required_error: "Vui lòng chọn kiểu nhãn",
    }),
    startRow: z.string().min(1, "Nhãn bắt đầu là bắt buộc"),
    startCol: z.coerce.number().int().min(1, "Số bắt đầu phải >= 1"),
    hSpacing: z.coerce.number().min(5, "Tối thiểu 5px"),
    vSpacing: z.coerce.number().min(5, "Tối thiểu 5px"),
    seatType: z.string().min(1, "Loại ghế là bắt buộc"),
  })
  .refine(
    (data) => {
      if (data.rowLabelType === "alpha") {
        return /^[a-zA-Z]$/.test(data.startRow);
      }
      return /^[0-9]+$/.test(data.startRow);
    },
    {
      message: "Nhãn hàng không hợp lệ với kiểu đã chọn",
      path: ["startRow"],
    }
  );

type SeatGeneratorFormValues = z.infer<typeof seatGeneratorSchema>;

interface SeatGeneratorProps {
  onGenerate: (config: SeatGenerationConfig) => void;
  isLoading?: boolean; // Thêm prop để disable form khi đang xử lý
}

export const SeatGenerator: React.FC<SeatGeneratorProps> = ({
  onGenerate,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SeatGeneratorFormValues>({
    resolver: zodResolver(seatGeneratorSchema),
    defaultValues: {
      rows: 5,
      cols: 10,
      rowLabelType: "alpha",
      startRow: "A",
      startCol: 1,
      hSpacing: 35,
      vSpacing: 35,
      seatType: "standard",
    },
  });

  // handleSubmit sẽ chỉ gọi onGenerate nếu validation thành công
  const handleFormSubmit = (data: SeatGeneratorFormValues) => {
    onGenerate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4 p-4 border-t"
    >
      <h4 className="font-medium text-center">Tạo Ghế Hàng Loạt</h4>
      <Separator />

      <fieldset disabled={isLoading} className="space-y-3">
        {/* Rows and Columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="rows">Số hàng</Label>
            <Input id="rows" {...register("rows")} type="number" />
            {errors.rows && (
              <p className="text-xs text-red-500 mt-1">{errors.rows.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="cols">Số ghế / hàng</Label>
            <Input id="cols" {...register("cols")} type="number" />
            {errors.cols && (
              <p className="text-xs text-red-500 mt-1">{errors.cols.message}</p>
            )}
          </div>
        </div>

        {/* Row Labeling */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Kiểu nhãn hàng</Label>
            <Controller
              name="rowLabelType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha">Chữ cái (A, B, C...)</SelectItem>
                    <SelectItem value="numeric">Chữ số (1, 2, 3...)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="startRow">Nhãn bắt đầu</Label>
            <Input id="startRow" {...register("startRow")} />
            {errors.startRow && (
              <p className="text-xs text-red-500 mt-1">
                {errors.startRow.message}
              </p>
            )}
          </div>
        </div>

        {/* Column Start */}
        <div>
          <Label htmlFor="startCol">Số ghế bắt đầu</Label>
          <Input id="startCol" {...register("startCol")} type="number" />
          {errors.startCol && (
            <p className="text-xs text-red-500 mt-1">
              {errors.startCol.message}
            </p>
          )}
        </div>

        {/* Spacing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="hSpacing">Giãn cách ngang (px)</Label>
            <Input id="hSpacing" {...register("hSpacing")} type="number" />
            {errors.hSpacing && (
              <p className="text-xs text-red-500 mt-1">
                {errors.hSpacing.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="vSpacing">Giãn cách dọc (px)</Label>
            <Input id="vSpacing" {...register("vSpacing")} type="number" />
            {errors.vSpacing && (
              <p className="text-xs text-red-500 mt-1">
                {errors.vSpacing.message}
              </p>
            )}
          </div>
        </div>

        {/* Seat Type */}
        <div>
          <Label htmlFor="seatType">Loại ghế (Seat Type)</Label>
          <Input
            id="seatType"
            {...register("seatType")}
            placeholder="standard, vip, wheelchair..."
          />
          {errors.seatType && (
            <p className="text-xs text-red-500 mt-1">
              {errors.seatType.message}
            </p>
          )}
        </div>
      </fieldset>

      <Button type="submit" className="w-full" disabled={isLoading}>
        Tạo Ghế
      </Button>
    </form>
  );
};

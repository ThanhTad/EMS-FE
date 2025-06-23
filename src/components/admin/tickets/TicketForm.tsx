// components/admin/tickets/TicketForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { CreateTicketRequest, TicketSelectionModeEnum } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Định nghĩa schema validation sử dụng Zod
const ticketFormSchema = z.object({
  eventId: z.string().uuid("Vui lòng chọn một sự kiện hợp lệ."),
  name: z.string().min(3, "Tên vé phải có ít nhất 3 ký tự."),
  price: z.coerce.number().min(0, "Giá vé không được là số âm."),
  description: z.string().optional(),
  saleStartDate: z.date().optional(),
  saleEndDate: z.date().optional(),
  statusId: z.number().min(1, "Vui lòng chọn trạng thái."),

  // Các trường phụ thuộc
  appliesToSectionId: z.string().optional(),
  totalQuantity: z.coerce
    .number()
    .int()
    .positive("Số lượng phải là số nguyên dương.")
    .optional(),
  maxPerPurchase: z.coerce
    .number()
    .int()
    .positive("Số lượng tối đa phải là số nguyên dương.")
    .optional(),
});

type SelectOption = { value: string; label: string };

interface TicketFormProps {
  initialData?: CreateTicketRequest | null;
  onSubmit: (data: CreateTicketRequest) => Promise<void>;
  isLoading: boolean;
  isEditMode?: boolean;
  eventOptions: SelectOption[];
  statusOptions: SelectOption[];
  sectionOptions?: SelectOption[];
  onEventChange: (eventId: string) => void;
  isFetchingSections: boolean;
  selectedEventTicketMode?: TicketSelectionModeEnum | null;
}

export default function TicketForm({
  initialData,
  onSubmit,
  isLoading,
  isEditMode = false,
  eventOptions,
  statusOptions,
  sectionOptions = [],
  onEventChange,
  isFetchingSections,
  selectedEventTicketMode,
}: TicketFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      eventId: initialData?.eventId || "",
      name: initialData?.name || "",
      price: initialData?.price || 0,
      description: initialData?.description || "",
      saleStartDate: initialData?.saleStartDate
        ? new Date(initialData.saleStartDate)
        : undefined,
      saleEndDate: initialData?.saleEndDate
        ? new Date(initialData.saleEndDate)
        : undefined,
      statusId: initialData?.statusId,
      appliesToSectionId: initialData?.appliesToSectionId || "",
      totalQuantity: initialData?.totalQuantity || undefined,
      maxPerPurchase: initialData?.maxPerPurchase || 5,
    },
  });

  const watchEventId = watch("eventId");

  // Hàm wrapper để xử lý submit với kiểu dữ liệu đúng
  const handleFormSubmit = (data: z.infer<typeof ticketFormSchema>) => {
    const payload: CreateTicketRequest = {
      ...data,
      saleStartDate: data.saleStartDate?.toISOString(),
      saleEndDate: data.saleEndDate?.toISOString(),
      statusId: Number(data.statusId),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <fieldset disabled={isLoading} className="space-y-4">
        {/* Event Selection */}
        <div className="space-y-2">
          <Label htmlFor="eventId">Sự kiện *</Label>
          <Controller
            name="eventId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  onEventChange(value);
                  setValue("appliesToSectionId", "");
                }}
                defaultValue={field.value}
              >
                <SelectTrigger id="eventId">
                  <SelectValue placeholder="Chọn một sự kiện..." />
                </SelectTrigger>
                <SelectContent>
                  {eventOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.eventId && (
            <p className="text-sm text-red-500">{errors.eventId.message}</p>
          )}
        </div>

        {/* Ticket Name & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên loại vé *</Label>
            <Input
              id="name"
              placeholder="Ví dụ: Vé VIP, Vé thường..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Giá vé (VND) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="0"
              {...register("price")}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>
        </div>

        {/* Conditional Fields based on Ticket Mode */}
        {watchEventId && (
          <>
            {selectedEventTicketMode === TicketSelectionModeEnum.SEATED && (
              <div className="space-y-2">
                <Label htmlFor="appliesToSectionId">
                  Áp dụng cho khu vực *
                </Label>
                <Controller
                  name="appliesToSectionId"
                  control={control}
                  rules={{
                    required:
                      selectedEventTicketMode ===
                      TicketSelectionModeEnum.SEATED,
                  }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isFetchingSections}
                    >
                      <SelectTrigger id="appliesToSectionId">
                        <SelectValue
                          placeholder={
                            isFetchingSections
                              ? "Đang tải khu vực..."
                              : "Chọn một khu vực"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.appliesToSectionId && (
                  <p className="text-sm text-red-500">
                    {errors.appliesToSectionId.message}
                  </p>
                )}
              </div>
            )}

            {selectedEventTicketMode ===
              TicketSelectionModeEnum.GENERAL_ADMISSION && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalQuantity">Tổng số lượng vé</Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    placeholder="100"
                    {...register("totalQuantity")}
                  />
                  {errors.totalQuantity && (
                    <p className="text-sm text-red-500">
                      {errors.totalQuantity.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPerPurchase">Tối đa mỗi lần mua</Label>
                  <Input
                    id="maxPerPurchase"
                    type="number"
                    placeholder="5"
                    {...register("maxPerPurchase")}
                  />
                  {errors.maxPerPurchase && (
                    <p className="text-sm text-red-500">
                      {errors.maxPerPurchase.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả (Tùy chọn)</Label>
          <Textarea
            id="description"
            placeholder="Mô tả các quyền lợi của loại vé này..."
            {...register("description")}
          />
        </div>

        {/* Sale Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ngày bắt đầu bán</Label>
            <Controller
              name="saleStartDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Ngày kết thúc bán</Label>
            <Controller
              name="saleEndDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="statusId">Trạng thái *</Label>
          <Controller
            name="statusId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                defaultValue={field.value?.toString()}
              >
                <SelectTrigger id="statusId" className="w-[180px]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.statusId && (
            <p className="text-sm text-red-500">{errors.statusId.message}</p>
          )}
        </div>
      </fieldset>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditMode ? "Cập nhật vé" : "Tạo vé"}
      </Button>
    </form>
  );
}

// components/admin/tickets/TicketForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale"; // Thêm locale tiếng Việt

import {
  CreateTicketRequest,
  Ticket,
  Event,
  TicketSelectionModeEnum,
} from "@/types";
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
import { Input as ShadInput } from "@/components/ui/input"; // ShadCN input để disabled

// Schema validation được cập nhật
const ticketFormSchema = z
  .object({
    name: z.string().min(3, "Tên vé phải có ít nhất 3 ký tự."),
    price: z.coerce.number().min(0, "Giá vé không được là số âm."),
    statusId: z.coerce.number().min(1, "Vui lòng chọn trạng thái."),
    description: z.string().optional(),
    saleStartDate: z.date().optional(),
    saleEndDate: z.date().optional(),
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
  })
  .refine(
    (data) => {
      // Thêm validation: nếu có ngày kết thúc thì phải sau ngày bắt đầu
      if (data.saleStartDate && data.saleEndDate) {
        return data.saleEndDate > data.saleStartDate;
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu.",
      path: ["saleEndDate"],
    }
  );

type TicketFormValues = z.infer<typeof ticketFormSchema>;

type SelectOption = { value: string; label: string };

// Props đã được đơn giản hóa
interface TicketFormProps {
  initialData?: Ticket | null;
  onSubmit: (data: Omit<CreateTicketRequest, "eventId">) => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
  event: Event; // << BẮT BUỘC phải có event
  statusOptions: SelectOption[];
  sectionOptions: SelectOption[];
}

export default function TicketForm({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
  event,
  statusOptions,
  sectionOptions,
}: TicketFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
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

  const handleFormSubmit = (data: TicketFormValues) => {
    const payload: Omit<CreateTicketRequest, "eventId"> = {
      ...data,
      saleStartDate: data.saleStartDate?.toISOString(),
      saleEndDate: data.saleEndDate?.toISOString(),
    };
    onSubmit(payload);
  };

  // Xác định các trường nào cần hiển thị dựa trên ticketSelectionMode của sự kiện
  const showSectionSelect =
    event.ticketSelectionMode === TicketSelectionModeEnum.RESERVED_SEATING ||
    event.ticketSelectionMode === TicketSelectionModeEnum.ZONED_ADMISSION;
  const showQuantityFields =
    event.ticketSelectionMode === TicketSelectionModeEnum.GENERAL_ADMISSION ||
    event.ticketSelectionMode === TicketSelectionModeEnum.ZONED_ADMISSION;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <fieldset disabled={isLoading} className="space-y-4">
        {/* Event - Hiển thị dạng text, không cho sửa */}
        <div className="space-y-2">
          <Label>Sự kiện</Label>
          <ShadInput value={event.title} disabled />
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

        {/* Conditional Fields: Section & Quantity */}
        {showSectionSelect && (
          <div className="space-y-2">
            <Label htmlFor="appliesToSectionId">Áp dụng cho khu vực *</Label>
            <Controller
              name="appliesToSectionId"
              control={control}
              rules={{ required: showSectionSelect }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="appliesToSectionId">
                    <SelectValue placeholder="Chọn một khu vực..." />
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
              <p className="text-sm text-red-500">Vui lòng chọn khu vực.</p>
            )}
          </div>
        )}

        {showQuantityFields && (
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
                        format(field.value, "PPP", { locale: vi })
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
                        format(field.value, "PPP", { locale: vi })
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
            {errors.saleEndDate && (
              <p className="text-sm text-red-500">
                {errors.saleEndDate.message}
              </p>
            )}
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
                onValueChange={(val) => field.onChange(val)}
                defaultValue={field.value?.toString()}
              >
                <SelectTrigger id="statusId" className="w-full md:w-[240px]">
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

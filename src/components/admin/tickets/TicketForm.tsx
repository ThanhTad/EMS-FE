// components/admin/tickets/TicketForm.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Ticket } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  PlusCircle,
  ArrowLeft,
  Ticket as TicketIcon,
} from "lucide-react";
import Link from "next/link";

// Option cho select sự kiện, trạng thái
interface EventOption {
  id: string;
  name: string;
}
interface StatusOption {
  id: number;
  name: string;
}

const baseTicketSchema = z.object({
  eventId: z.string().min(1, "Bắt buộc chọn sự kiện"),
  ticketType: z.string().min(1, "Loại vé không được để trống").max(255),
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  totalQuantity: z.coerce.number().int().min(1, "Số lượng tối thiểu là 1"),
  saleStartDate: z.string().min(1, "Chọn ngày bắt đầu bán vé"),
  saleEndDate: z.string().min(1, "Chọn ngày kết thúc bán vé"),
  statusId: z.coerce.number().int(),
  maxPerUser: z.coerce
    .number()
    .int()
    .min(1, "Tối thiểu 1")
    .max(5, "Tối đa 5")
    .optional(),
  description: z
    .string()
    .max(1000, "Mô tả tối đa 1000 ký tự")
    .optional()
    .or(z.literal("")),
  earlyBirdDiscount: z.coerce
    .number()
    .min(0, "Discount không âm")
    .max(1, "Tối đa 100%")
    .optional(),
  isFree: z.boolean(),
});

type TicketFormValues = z.infer<typeof baseTicketSchema>;

interface TicketFormProps {
  initialData?: Ticket | null;
  onSubmit: (data: TicketFormValues) => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
  eventOptions: EventOption[];
  statusOptions: StatusOption[];
}

const TicketForm: React.FC<TicketFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
  eventOptions,
  statusOptions,
}) => {
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(baseTicketSchema),
    defaultValues: {
      eventId: initialData?.eventId || "",
      ticketType: initialData?.ticketType || "",
      price: initialData?.price ?? 0,
      totalQuantity: initialData?.totalQuantity ?? 1,
      saleStartDate: initialData?.saleStartDate
        ? initialData.saleStartDate.slice(0, 16)
        : "",
      saleEndDate: initialData?.saleEndDate
        ? initialData.saleEndDate.slice(0, 16)
        : "",
      statusId: initialData?.statusId ?? statusOptions[0]?.id ?? 1,
      maxPerUser: initialData?.maxPerUser ?? 1,
      description: initialData?.description || "",
      earlyBirdDiscount: initialData?.earlyBirdDiscount ?? 0,
      isFree: initialData?.isFree ?? false,
    },
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        eventId: initialData.eventId,
        ticketType: initialData.ticketType,
        price: initialData.price ?? 0,
        totalQuantity: initialData.totalQuantity ?? 1,
        saleStartDate: initialData.saleStartDate
          ? initialData.saleStartDate.slice(0, 16)
          : "",
        saleEndDate: initialData.saleEndDate
          ? initialData.saleEndDate.slice(0, 16)
          : "",
        statusId: initialData.statusId ?? statusOptions[0]?.id ?? 1,
        maxPerUser: initialData.maxPerUser ?? 1,
        description: initialData.description || "",
        earlyBirdDiscount: initialData.earlyBirdDiscount ?? 0,
        isFree: initialData.isFree ?? false,
      });
    }
  }, [initialData, isEditMode, form, statusOptions]);

  const saleStartDate = form.watch("saleStartDate");
  const saleEndDate = form.watch("saleEndDate");
  const timeInvalid =
    saleStartDate &&
    saleEndDate &&
    new Date(saleEndDate) <= new Date(saleStartDate);

  const isFree = form.watch("isFree");

  const handleFormSubmit = async (values: TicketFormValues) => {
    if (timeInvalid) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }
    try {
      // Nếu isFree thì set price về 0 và discount về 0
      if (values.isFree) {
        values.price = 0;
        values.earlyBirdDiscount = 0;
      }
      await onSubmit(values);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại!");
      } else {
        toast.error("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
      }
    }
  };

  return (
    <Card
      className="w-full max-w-2xl mx-auto"
      aria-labelledby="ticket-form-title"
    >
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        aria-describedby="ticket-form-desc"
      >
        <CardHeader>
          <CardTitle
            id="ticket-form-title"
            className="text-2xl flex items-center gap-2"
          >
            {isEditMode ? (
              <TicketIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <PlusCircle className="h-6 w-6" aria-hidden="true" />
            )}
            {isEditMode
              ? `Sửa vé: ${initialData?.ticketType || ""}`
              : "Thêm vé mới"}
          </CardTitle>
          <CardDescription id="ticket-form-desc">
            {isEditMode
              ? "Cập nhật thông tin chi tiết của vé."
              : "Điền thông tin để tạo vé mới cho sự kiện."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event select */}
          <div className="space-y-2">
            <Label htmlFor="eventId">Sự kiện</Label>
            <select
              id="eventId"
              {...form.register("eventId")}
              disabled={isLoading}
              className="w-full border rounded px-2 py-2"
              aria-invalid={!!form.formState.errors.eventId}
            >
              <option value="">-- Chọn sự kiện --</option>
              {eventOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            {form.formState.errors.eventId && (
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.eventId.message}
              </p>
            )}
          </div>
          {/* Ticket type */}
          <div className="space-y-2">
            <Label htmlFor="ticketType">Loại vé</Label>
            <Input
              id="ticketType"
              placeholder="Ví dụ: Thường, VIP, Early Bird..."
              required
              {...form.register("ticketType")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.ticketType}
            />
            {form.formState.errors.ticketType && (
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.ticketType.message}
              </p>
            )}
          </div>
          {/* Is free checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="isFree"
              type="checkbox"
              {...form.register("isFree")}
              disabled={isLoading}
              className="h-4 w-4"
            />
            <Label htmlFor="isFree" className="mb-0 cursor-pointer">
              Vé miễn phí
            </Label>
          </div>
          {/* Price */}
          {!isFree && (
            <div className="space-y-2">
              <Label htmlFor="price">Giá vé (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={1000}
                placeholder="Nhập giá vé"
                {...form.register("price")}
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.price}
              />
              {form.formState.errors.price && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
          )}
          {/* Early bird discount */}
          {!isFree && (
            <div className="space-y-2">
              <Label htmlFor="earlyBirdDiscount">Early Bird Discount (%)</Label>
              <Input
                id="earlyBirdDiscount"
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Ví dụ: 20 cho 20% giảm giá"
                value={
                  form.watch("earlyBirdDiscount") !== undefined
                    ? Number(form.watch("earlyBirdDiscount")) * 100
                    : ""
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    form.setValue("earlyBirdDiscount", undefined);
                  } else {
                    form.setValue("earlyBirdDiscount", Number(v) / 100);
                  }
                }}
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.earlyBirdDiscount}
              />
              <p className="text-xs text-muted-foreground">
                Nhập giá trị phần trăm, ví dụ 20 cho 20%.
              </p>
              {form.formState.errors.earlyBirdDiscount && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.earlyBirdDiscount.message as string}
                </p>
              )}
            </div>
          )}
          {/* Total quantity */}
          <div className="space-y-2">
            <Label htmlFor="totalQuantity">Tổng số vé</Label>
            <Input
              id="totalQuantity"
              type="number"
              min={1}
              step={1}
              placeholder="Nhập tổng số vé"
              {...form.register("totalQuantity")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.totalQuantity}
            />
            {form.formState.errors.totalQuantity && (
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.totalQuantity.message}
              </p>
            )}
          </div>
          {/* Max per user */}
          <div className="space-y-2">
            <Label htmlFor="maxPerUser">Số vé tối đa mỗi người</Label>
            <Input
              id="maxPerUser"
              type="number"
              min={1}
              max={5}
              step={1}
              placeholder="Tối đa 5 vé"
              {...form.register("maxPerUser")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.maxPerUser}
            />
            {form.formState.errors.maxPerUser && (
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.maxPerUser.message}
              </p>
            )}
          </div>
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              placeholder="Mô tả chi tiết vé"
              {...form.register("description")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.description}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          {/* Sale start/end date */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="saleStartDate">Bắt đầu bán</Label>
              <Input
                id="saleStartDate"
                type="datetime-local"
                {...form.register("saleStartDate")}
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.saleStartDate}
              />
              {form.formState.errors.saleStartDate && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.saleStartDate.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="saleEndDate">Kết thúc bán</Label>
              <Input
                id="saleEndDate"
                type="datetime-local"
                {...form.register("saleEndDate")}
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.saleEndDate}
              />
              {form.formState.errors.saleEndDate && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.saleEndDate.message}
                </p>
              )}
              {timeInvalid && (
                <p className="text-xs text-red-600 mt-1">
                  Ngày kết thúc phải sau ngày bắt đầu!
                </p>
              )}
            </div>
          </div>
          {/* Status select */}
          <div className="space-y-2">
            <Label htmlFor="statusId">Trạng thái vé</Label>
            <select
              id="statusId"
              {...form.register("statusId")}
              disabled={isLoading}
              className="w-full border rounded px-2 py-2"
              aria-invalid={!!form.formState.errors.statusId}
            >
              {statusOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {form.formState.errors.statusId && (
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.statusId.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            asChild
            type="button"
            aria-disabled={isLoading}
            disabled={isLoading}
          >
            <Link href="/admin/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Quay lại
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={isLoading || Boolean(timeInvalid)}
            aria-busy={isLoading}
            aria-disabled={isLoading || Boolean(timeInvalid)}
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                {isEditMode ? "Lưu thay đổi" : "Tạo vé"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TicketForm;

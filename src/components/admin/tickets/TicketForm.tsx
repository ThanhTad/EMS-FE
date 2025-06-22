// components/admin/tickets/TicketForm.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateTicketRequest, Ticket } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ArrowLeft, Ticket as TicketIcon } from "lucide-react";
import Link from "next/link";

// Định nghĩa kiểu cho các option của Select component
interface SelectOption {
  value: string;
  label: string;
}

// Schema validation sử dụng Zod, đã được cập nhật để khớp với CSDL
const ticketSchema = z
  .object({
    eventId: z.string().min(1, "Bắt buộc chọn sự kiện"),
    name: z.string().min(1, "Tên vé không được để trống").max(100),
    price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    description: z.string().max(1000, "Mô tả quá dài").optional(),
    saleStartDate: z.string().min(1, "Chọn ngày bắt đầu bán"),
    saleEndDate: z.string().min(1, "Chọn ngày kết thúc bán"),
    appliesToSectionId: z.string().optional().nullable(),
    totalQuantity: z.coerce.number().int().min(1, "Số lượng tối thiểu là 1"),
    maxPerPurchase: z.coerce.number().int().min(1, "Tối thiểu 1").max(20),
    statusId: z.coerce.number().int(),
  })
  .refine((data) => new Date(data.saleEndDate) > new Date(data.saleStartDate), {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["saleEndDate"],
  });

// Type cho các giá trị trong form
type TicketFormValues = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  initialData?: Ticket | null;
  onSubmit: (data: CreateTicketRequest) => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
  eventOptions: SelectOption[];
  statusOptions: SelectOption[];
  sectionOptions: SelectOption[]; // Các khu vực của sự kiện, cho vé ngồi
}

const TicketForm: React.FC<TicketFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
  eventOptions,
  statusOptions,
  sectionOptions,
}) => {
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      eventId: initialData?.eventId || "",
      name: initialData?.name || "",
      price: initialData?.price ?? 0,
      description: initialData?.description || "",
      saleStartDate: initialData?.saleStartDate?.slice(0, 16) || "",
      saleEndDate: initialData?.saleEndDate?.slice(0, 16) || "",
      appliesToSectionId: initialData?.appliesToSectionId || null,
      totalQuantity: initialData?.totalQuantity ?? 100,
      maxPerPurchase: initialData?.maxPerPurchase ?? 5,
      statusId: initialData?.statusId ?? Number(statusOptions[0]?.value),
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        saleStartDate: initialData.saleStartDate?.slice(0, 16) || "",
        saleEndDate: initialData.saleEndDate?.slice(0, 16) || "",
        appliesToSectionId: initialData.appliesToSectionId || null,
      });
    }
  }, [initialData, form]);

  const handleFormSubmit = async (values: TicketFormValues) => {
    await onSubmit({
      ...values,
      saleStartDate: new Date(values.saleStartDate).toISOString(),
      saleEndDate: new Date(values.saleEndDate).toISOString(),
      appliesToSectionId: values.appliesToSectionId || undefined,
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TicketIcon className="h-6 w-6" />
            {isEditMode ? `Sửa vé: ${initialData?.name}` : "Tạo vé mới"}
          </CardTitle>
          <CardDescription>
            Điền thông tin chi tiết để tạo hoặc cập nhật vé cho sự kiện.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột trái */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventId">Sự kiện *</Label>
              <Select
                disabled={isLoading || isEditMode}
                onValueChange={(value) => form.setValue("eventId", value)}
                defaultValue={form.getValues("eventId")}
              >
                <SelectTrigger id="eventId">
                  <SelectValue placeholder="-- Chọn sự kiện --" />
                </SelectTrigger>
                <SelectContent>
                  {eventOptions.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.eventId && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.eventId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="name">Tên vé *</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Vé phổ thông, Vé VIP..."
                {...form.register("name")}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="price">Giá vé (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                placeholder="Nhập 0 cho vé miễn phí"
                {...form.register("price")}
                disabled={isLoading}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả quyền lợi của loại vé này..."
                {...form.register("description")}
                disabled={isLoading}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </div>
          {/* Cột phải */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="saleStartDate">Thời gian mở bán *</Label>
              <Input
                id="saleStartDate"
                type="datetime-local"
                {...form.register("saleStartDate")}
                disabled={isLoading}
              />
              {form.formState.errors.saleStartDate && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.saleStartDate.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="saleEndDate">Thời gian kết thúc bán *</Label>
              <Input
                id="saleEndDate"
                type="datetime-local"
                {...form.register("saleEndDate")}
                disabled={isLoading}
              />
              {form.formState.errors.saleEndDate && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.saleEndDate.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalQuantity">Tổng số lượng *</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  min="1"
                  {...form.register("totalQuantity")}
                  disabled={isLoading}
                />
                {form.formState.errors.totalQuantity && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.totalQuantity.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="maxPerPurchase">Tối đa/lần mua *</Label>
                <Input
                  id="maxPerPurchase"
                  type="number"
                  min="1"
                  {...form.register("maxPerPurchase")}
                  disabled={isLoading}
                />
                {form.formState.errors.maxPerPurchase && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.maxPerPurchase.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="appliesToSectionId">Áp dụng cho khu vực</Label>
              <Select
                disabled={isLoading}
                onValueChange={(value) =>
                  form.setValue("appliesToSectionId", value || null)
                }
                defaultValue={form.getValues("appliesToSectionId") || ""}
              >
                <SelectTrigger id="appliesToSectionId">
                  <SelectValue placeholder="-- Vé vào cửa chung (GA) --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Vé vào cửa chung (GA) --</SelectItem>
                  {sectionOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Bỏ trống nếu đây là vé không áp dụng cho khu vực cụ thể.
              </p>
            </div>
            <div>
              <Label htmlFor="statusId">Trạng thái *</Label>
              <Select
                disabled={isLoading}
                onValueChange={(value) =>
                  form.setValue("statusId", Number(value))
                }
                defaultValue={String(form.getValues("statusId"))}
              >
                <SelectTrigger id="statusId">
                  <SelectValue placeholder="-- Chọn trạng thái --" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild type="button" disabled={isLoading}>
            <Link
              href={
                isEditMode
                  ? `/admin/events/${initialData?.eventId}`
                  : "/admin/events"
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Lưu thay đổi" : "Tạo vé"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TicketForm;

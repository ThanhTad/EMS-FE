// components/admin/events/EventForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Event,
  UserRole,
  TicketSelectionModeEnum,
  SeatMap,
  Category,
  Venue,
  User,
  AuthUser,
  CreateEventRequest,
} from "@/types";
import { getSeatMapsByVenue } from "@/lib/api";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  PlusCircle,
  ArrowLeft,
  CalendarCheck2,
} from "lucide-react";
import Link from "next/link";
import { MultiSelect } from "@/components/shared/MultiSelect";

// ===================================
// Zod Schema (Cập nhật để nhất quán)
// ===================================
const eventFormSchema = z
  .object({
    title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự.").max(255),
    description: z.string().max(5000).optional(),
    startDate: z.string().min(1, "Bắt buộc chọn thời gian bắt đầu."),
    endDate: z.string().min(1, "Bắt buộc chọn thời gian kết thúc."),
    categoryIds: z
      .array(z.string())
      .min(1, "Bắt buộc chọn ít nhất 1 danh mục."),
    creatorId: z.string(), // Sẽ được set ở logic submit, không bắt buộc trong form
    isPublic: z.boolean(),
    ticketSelectionMode: z.nativeEnum(TicketSelectionModeEnum),
    venueId: z.string().min(1, "Bắt buộc chọn địa điểm."),
    seatMapId: z.string().optional(),
    coverImageUrl: z
      .string()
      .url("URL ảnh không hợp lệ.")
      .optional()
      .or(z.literal("")),
    statusId: z.number(), // Thêm statusId để có thể lưu bản nháp
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu.",
    path: ["endDate"],
  })
  .superRefine((data, ctx) => {
    if (
      data.ticketSelectionMode === TicketSelectionModeEnum.RESERVED_SEATING &&
      (!data.seatMapId || data.seatMapId.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bắt buộc chọn sơ đồ chỗ ngồi.",
        path: ["seatMapId"],
      });
    }
  });

// Dùng CreateEventRequest từ types.ts để nhất quán
type EventFormValues = CreateEventRequest;

// ===================================
// Props Interface (Đơn giản hóa)
// ===================================
interface EventFormProps {
  initialData?: Event | null;
  onSubmit: (data: EventFormValues) => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
  // Nhận toàn bộ object thay vì chỉ id/name
  categoryOptions: Category[];
  venueOptions: Venue[];
  organizerOptions: User[];
  currentUser: AuthUser;
}

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
  categoryOptions,
  venueOptions,
  organizerOptions,
  currentUser,
}) => {
  const [seatMapOptions, setSeatMapOptions] = useState<SeatMap[]>([]);
  const [isSeatMapsLoading, setIsSeatMapsLoading] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      categoryIds: [],
      creatorId: currentUser?.id, // Mặc định là người dùng hiện tại
      isPublic: true, // Mặc định là public
      ticketSelectionMode: TicketSelectionModeEnum.GENERAL_ADMISSION,
      venueId: "",
      seatMapId: "",
      coverImageUrl: "",
    },
  });

  const selectedVenueId = form.watch("venueId");
  const selectedMode = form.watch("ticketSelectionMode");

  // Effect để điền dữ liệu khi ở chế độ Edit
  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        ...initialData,
        startDate: initialData.startDate
          ? initialData.startDate.slice(0, 16)
          : "",
        endDate: initialData.endDate ? initialData.endDate.slice(0, 16) : "",
        categoryIds: initialData.categories?.map((cat) => cat.id) || [],
        creatorId: initialData.creatorId || currentUser?.id,
        venueId: initialData.venueId || "",
        seatMapId: initialData.seatMapId || "",
      });
    }
  }, [initialData, isEditMode, form, currentUser?.id]);

  // Effect để fetch sơ đồ chỗ ngồi
  useEffect(() => {
    if (selectedMode !== TicketSelectionModeEnum.RESERVED_SEATING) {
      setSeatMapOptions([]);
      form.setValue("seatMapId", ""); // Reset giá trị
      return;
    }

    if (!selectedVenueId) {
      setSeatMapOptions([]);
      return;
    }

    let isMounted = true;
    const fetchSeatMaps = async () => {
      setIsSeatMapsLoading(true);
      try {
        const paginatedResult = await getSeatMapsByVenue(selectedVenueId, {
          size: 100,
        });
        if (isMounted) setSeatMapOptions(paginatedResult.content);
      } catch (error) {
        if (error instanceof Error) {
          toast.error("Không thể tải danh sách sơ đồ chỗ ngồi.");
        }
        if (isMounted) setSeatMapOptions([]);
      } finally {
        if (isMounted) setIsSeatMapsLoading(false);
      }
    };

    fetchSeatMaps();

    return () => {
      isMounted = false;
    };
  }, [selectedVenueId, selectedMode, form]);

  const TICKET_SELECTION_MODES = [
    {
      value: TicketSelectionModeEnum.GENERAL_ADMISSION,
      label: "Vé Phổ thông (Không chọn chỗ)",
    },
    {
      value: TicketSelectionModeEnum.RESERVED_SEATING,
      label: "Sự kiện có chỗ ngồi (Yêu cầu Sơ đồ)",
    },
  ];

  const creatorName =
    (isEditMode && initialData?.creator?.fullName) ||
    initialData?.creator?.username ||
    "";

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {isEditMode ? <CalendarCheck2 /> : <PlusCircle />}
            {isEditMode ? `Chỉnh sửa sự kiện` : "Tạo sự kiện mới"}
          </CardTitle>
          <CardDescription>
            {isEditMode && (
              <p className="font-semibold text-primary">{initialData?.title}</p>
            )}
            Điền đầy đủ thông tin. Các trường có dấu * là bắt buộc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề sự kiện *</Label>
              <Input
                id="title"
                placeholder="VD: Đêm nhạc Trịnh Công Sơn"
                {...form.register("title")}
                disabled={isLoading}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                placeholder="Giới thiệu về sự kiện, nghệ sĩ, lịch trình..."
                {...form.register("description")}
                disabled={isLoading}
                className="min-h-[120px]"
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">URL Ảnh bìa</Label>
              <Input
                id="coverImageUrl"
                placeholder="https://example.com/image.png"
                {...form.register("coverImageUrl")}
                disabled={isLoading}
              />
              {form.formState.errors.coverImageUrl && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.coverImageUrl.message}
                </p>
              )}
            </div>

            {/* Categories (Sử dụng MultiSelect component) */}
            <div className="space-y-2">
              <Label>Danh mục *</Label>
              <Controller
                name="categoryIds"
                control={form.control}
                render={({ field }) => (
                  <MultiSelect
                    options={categoryOptions.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Chọn danh mục..."
                    disabled={isLoading}
                  />
                )}
              />
              {form.formState.errors.categoryIds && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.categoryIds.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Thời gian & Địa điểm */}
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="font-semibold text-lg">Thời gian & Địa điểm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Thời gian bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  {...form.register("startDate")}
                  disabled={isLoading}
                />
                {form.formState.errors.startDate && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>
              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Thời gian kết thúc *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  {...form.register("endDate")}
                  disabled={isLoading}
                />
                {form.formState.errors.endDate && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-2">
              <Label htmlFor="venueId">Địa điểm tổ chức *</Label>
              <Controller
                name="venueId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Chọn địa điểm --" />
                    </SelectTrigger>
                    <SelectContent>
                      {venueOptions.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.venueId && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.venueId.message}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Cấu hình vé */}
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="font-semibold text-lg">Cấu hình vé</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ticket Selection Mode */}
              <div className="space-y-2">
                <Label>Chế độ bán vé *</Label>
                <Controller
                  name="ticketSelectionMode"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_SELECTION_MODES.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Seat Map (Conditional) */}
              {selectedMode === TicketSelectionModeEnum.RESERVED_SEATING && (
                <div className="space-y-2">
                  <Label>Sơ đồ chỗ ngồi *</Label>
                  <Controller
                    name="seatMapId"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={
                          isLoading || isSeatMapsLoading || !selectedVenueId
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isSeatMapsLoading
                                ? "Đang tải..."
                                : "-- Chọn sơ đồ --"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {seatMapOptions.map((sm) => (
                            <SelectItem key={sm.id} value={sm.id}>
                              {sm.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.seatMapId && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.seatMapId.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Cài đặt khác */}
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="font-semibold text-lg">Cài đặt khác</h3>
            {/* Creator */}
            <div className="space-y-2">
              <Label>Người tạo sự kiện</Label>
              {currentUser?.role === UserRole.ADMIN && !isEditMode ? (
                <Controller
                  name="creatorId"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- Gán cho Organizer --" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Option cho chính admin */}
                        <SelectItem value={currentUser.id}>
                          {currentUser.username} (Tôi)
                        </SelectItem>
                        {organizerOptions.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <Input
                  value={isEditMode ? creatorName : currentUser?.username}
                  readOnly
                  disabled
                />
              )}
            </div>
            {/* isPublic Checkbox */}
            <Controller
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="isPublic"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="isPublic"
                    className="font-normal leading-snug"
                  >
                    Công khai sự kiện (Hiển thị trên trang khám phá, kết quả tìm
                    kiếm)
                  </Label>
                </div>
              )}
            />
            <p className="text-xs text-muted-foreground -mt-2">
              Sự kiện riêng tư (không check) chỉ có thể được truy cập qua link.
              Tất cả sự kiện đều cần được duyệt.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild type="button" disabled={isLoading}>
            <Link href="/admin/events">
              <ArrowLeft className="mr-2 h-4 w-4" /> Hủy
            </Link>
          </Button>
          <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />{" "}
                {isEditMode ? "Lưu thay đổi" : "Tạo sự kiện"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EventForm;

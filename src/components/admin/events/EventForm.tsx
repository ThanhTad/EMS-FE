// components/admin/events/EventForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Event, UserRole, TicketSelectionModeEnum, SeatMap } from "@/types";
import { getSeatMapsByVenue } from "@/lib/api"; // <-- GIẢ SỬ BẠN CÓ API NÀY
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
  CalendarCheck2,
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

// Define option types for props
interface CategoryOption {
  id: string;
  name: string;
}

interface ModeratorOption {
  id: string;
  username: string;
}

interface VenueOption {
  id: string;
  name: string;
}

// Zod schema with conditional validation for seatMapId
const eventFormSchema = z
  .object({
    title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự.").max(200),
    description: z.string().max(5000).optional(), // Increased limit, optional
    startDate: z.string().min(1, "Bắt buộc chọn thời gian bắt đầu"),
    endDate: z.string().min(1, "Bắt buộc chọn thời gian kết thúc"),
    categoryIds: z.array(z.string()).min(1, "Bắt buộc chọn ít nhất 1 danh mục"),
    creatorId: z.string().min(1, "Bắt buộc chọn người tạo"),
    isPublic: z.boolean(),
    ticketSelectionMode: z.nativeEnum(TicketSelectionModeEnum, {
      errorMap: () => ({ message: "Bắt buộc chọn chế độ chọn vé." }),
    }),
    venueId: z.string().min(1, "Bắt buộc chọn địa điểm"),
    seatMapId: z.string().optional(),
    coverImageUrl: z
      .string()
      .url("URL ảnh không hợp lệ")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu.",
    path: ["endDate"],
  })
  .superRefine((data, ctx) => {
    if (data.ticketSelectionMode === TicketSelectionModeEnum.SEATED) {
      if (!data.seatMapId || data.seatMapId.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bắt buộc chọn sơ đồ chỗ ngồi cho sự kiện có chỗ ngồi.",
          path: ["seatMapId"],
        });
      }
    }
  });

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: Event | null;
  onSubmit: (data: EventFormValues) => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
  categoryOptions: CategoryOption[];
  currentUserId: string;
  currentUsername: string;
  currentUserRole: UserRole;
  moderatorOptions?: ModeratorOption[];
  creatorName?: string;
  defaultIsPublic?: boolean;
  ticketSelectionModes: { value: TicketSelectionModeEnum; label: string }[];
  venueOptions: VenueOption[];
}

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
  categoryOptions,
  currentUserId,
  currentUsername,
  currentUserRole,
  moderatorOptions = [],
  creatorName,
  defaultIsPublic,
  ticketSelectionModes,
  venueOptions,
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
      creatorId: currentUserId,
      isPublic: defaultIsPublic ?? false,
      ticketSelectionMode:
        ticketSelectionModes[0]?.value ||
        TicketSelectionModeEnum.GENERAL_ADMISSION,
      venueId: "",
      seatMapId: "",
      coverImageUrl: "",
    },
  });

  // Watch for changes in relevant form fields
  const selectedVenueId = form.watch("venueId");
  const selectedMode = form.watch("ticketSelectionMode");

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        startDate: initialData.startDate
          ? initialData.startDate.slice(0, 16)
          : "",
        endDate: initialData.endDate ? initialData.endDate.slice(0, 16) : "",
        categoryIds: initialData.categories?.map((cat) => cat.id) || [],
        creatorId: initialData.creator?.id || currentUserId,
        isPublic: initialData.isPublic ?? defaultIsPublic ?? false,
        ticketSelectionMode: initialData.ticketSelectionMode,
        venueId: initialData.venueId || "",
        seatMapId: initialData.seatMapId || "",
        coverImageUrl: initialData.coverImageUrl || "",
      });
    }
  }, [initialData, form, currentUserId, defaultIsPublic]);

  // Effect to fetch seat maps when venue or mode changes
  useEffect(() => {
    // Don't clear seatMapId if we are in edit mode and the options haven't loaded yet
    if (selectedMode !== TicketSelectionModeEnum.SEATED) {
      setSeatMapOptions([]);
      if (form.getValues("seatMapId")) {
        form.setValue("seatMapId", "");
      }
      return;
    }

    let isMounted = true;
    if (selectedVenueId) {
      const fetchSeatMaps = async () => {
        setIsSeatMapsLoading(true);
        try {
          const paginatedResult = await getSeatMapsByVenue(selectedVenueId, {
            size: 100,
          });
          if (isMounted) {
            setSeatMapOptions(paginatedResult.content);
          }
        } catch (error) {
          if (error) toast.error("Không thể tải danh sách sơ đồ chỗ ngồi.");
          if (isMounted) {
            setSeatMapOptions([]);
          }
        } finally {
          if (isMounted) {
            setIsSeatMapsLoading(false);
          }
        }
      };
      fetchSeatMaps();
    } else {
      setSeatMapOptions([]);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedVenueId, selectedMode, form]);

  const handleFormSubmit = async (values: EventFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi không xác định.";
      toast.error(errorMessage);
    }
  };

  // Logic to render creator field based on role
  const renderCreatorField = () => {
    if (isEditMode) {
      return (
        <div className="space-y-2">
          <Label>Người tạo</Label>
          <Input value={creatorName || currentUsername} readOnly disabled />
        </div>
      );
    }
    if (currentUserRole === UserRole.ADMIN) {
      return (
        <div className="space-y-2">
          <Label htmlFor="creatorId">Gán cho Organizer</Label>
          <select
            id="creatorId"
            {...form.register("creatorId")}
            className="w-full border rounded px-2 py-2"
            disabled={isLoading}
          >
            <option value="">-- Chọn Organizer --</option>
            {moderatorOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
          {form.formState.errors.creatorId && (
            <p className="text-xs text-red-600 mt-1">
              {form.formState.errors.creatorId.message}
            </p>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <Label>Người tạo</Label>
        <Input value={currentUsername} readOnly disabled />
        <input
          type="hidden"
          {...form.register("creatorId")}
          value={currentUserId}
        />
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {isEditMode ? (
              <CalendarCheck2 className="h-6 w-6" />
            ) : (
              <PlusCircle className="h-6 w-6" />
            )}
            {isEditMode
              ? `Sửa sự kiện: ${initialData?.title || ""}`
              : "Thêm sự kiện mới"}
          </CardTitle>
          <CardDescription>
            Điền đầy đủ các thông tin cần thiết. Các trường có dấu * là bắt
            buộc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <textarea
              id="description"
              placeholder="Giới thiệu về sự kiện, nghệ sĩ, lịch trình..."
              {...form.register("description")}
              disabled={isLoading}
              className="w-full border rounded px-2 py-2 min-h-[120px]"
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
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
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.coverImageUrl.message}
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label htmlFor="categoryIds">Danh mục *</Label>
            <Controller
              name="categoryIds"
              control={form.control}
              render={({ field }) => (
                <select
                  id="categoryIds"
                  multiple
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
                  disabled={isLoading}
                  className="w-full border rounded px-2 py-2"
                  size={Math.min(5, categoryOptions.length || 1)}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều danh mục.
            </p>
            {form.formState.errors.categoryIds && (
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.categoryIds.message as string}
              </p>
            )}
          </div>

          {/* Creator */}
          {renderCreatorField()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticket Selection Mode */}
            <div className="space-y-2">
              <Label htmlFor="ticketSelectionMode">Chế độ bán vé *</Label>
              <select
                id="ticketSelectionMode"
                {...form.register("ticketSelectionMode")}
                className="w-full border rounded px-2 py-2"
                disabled={isLoading}
              >
                {ticketSelectionModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.ticketSelectionMode && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.ticketSelectionMode.message}
                </p>
              )}
            </div>

            {/* Venue */}
            <div className="space-y-2">
              <Label htmlFor="venueId">Địa điểm tổ chức *</Label>
              <select
                id="venueId"
                {...form.register("venueId")}
                className="w-full border rounded px-2 py-2"
                disabled={isLoading}
              >
                <option value="">-- Chọn địa điểm --</option>
                {venueOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.venueId && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.venueId.message}
                </p>
              )}
            </div>
          </div>

          {/* Seat Map (Conditional) */}
          {selectedMode === TicketSelectionModeEnum.SEATED && (
            <div className="space-y-2">
              <Label htmlFor="seatMapId">Sơ đồ chỗ ngồi *</Label>
              <select
                id="seatMapId"
                {...form.register("seatMapId")}
                className="w-full border rounded px-2 py-2"
                disabled={isLoading || isSeatMapsLoading || !selectedVenueId}
              >
                <option value="">
                  {isSeatMapsLoading
                    ? "Đang tải sơ đồ..."
                    : "-- Chọn sơ đồ chỗ ngồi --"}
                </option>
                {seatMapOptions.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    {sm.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.seatMapId && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.seatMapId.message}
                </p>
              )}
            </div>
          )}

          {/* Start/End time & isPublic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label htmlFor="startDate">Thời gian bắt đầu *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...form.register("startDate")}
                disabled={isLoading}
              />
              {form.formState.errors.startDate && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Thời gian kết thúc *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...form.register("endDate")}
                disabled={isLoading}
              />
              {form.formState.errors.endDate && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* isPublic Checkbox */}
          <Controller
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="isPublic"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
                <Label htmlFor="isPublic" className="font-normal">
                  Sự kiện riêng tư (Chỉ có thể truy cập qua link, không hiển thị
                  trên trang khám phá)
                </Label>
              </div>
            )}
          />
          <p className="text-xs text-muted-foreground -mt-4">
            Lưu ý: Sự kiện vẫn cần được quản trị viên duyệt trước khi có thể bán
            vé, kể cả khi là sự kiện riêng tư.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild type="button" disabled={isLoading}>
            <Link href="/admin/events">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Link>
          </Button>
          <Button type="submit" disabled={isLoading || !form.formState.isValid}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Lưu thay đổi" : "Gửi đi duyệt"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EventForm;

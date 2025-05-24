// components/admin/events/EventForm.tsx
"use client";

import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Event, UserRole } from "@/types";
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

interface CategoryOption {
  id: string;
  name: string;
}

interface ModeratorOption {
  id: string;
  username: string;
}

const baseEventSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự.").max(200),
  description: z.string().max(500).default(""),
  location: z.string().max(200).default(""),
  startDate: z.string().min(1, "Chọn thời gian bắt đầu"),
  endDate: z.string().min(1, "Chọn thời gian kết thúc"),
  categoryIds: z
    .array(z.string().min(1))
    .min(1, "Bắt buộc chọn ít nhất 1 danh mục"),
  creatorId: z.string().min(1, "Bắt buộc chọn người tạo"),
  isPublic: z.boolean(),
});

type EventFormValues = z.infer<typeof baseEventSchema>;

interface EventFormProps {
  initialData?: Event | null;
  onSubmit: (data: EventFormValues) => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
  categoryOptions: CategoryOption[];
  currentUserId: string;
  currentUsername: string;
  currentUserRole: UserRole;
  moderatorOptions?: ModeratorOption[]; // Chỉ truyền nếu là ADMIN
  creatorName?: string; // Để hiển thị khi sửa event
  defaultIsPublic?: boolean;
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
}) => {
  // Xác định giá trị mặc định cho creatorId
  const defaultCreatorId =
    isEditMode && initialData?.organizer
      ? initialData.organizer.id
      : currentUserId;

  const form = useForm({
    resolver: zodResolver(baseEventSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      startDate: initialData?.startDate
        ? initialData.startDate.slice(0, 16)
        : "",
      endDate: initialData?.endDate ? initialData.endDate.slice(0, 16) : "",
      categoryIds: initialData?.categories
        ? initialData.categories.map((cat) => cat.id)
        : [],
      creatorId: defaultCreatorId,
      isPublic:
        typeof initialData?.isPublic === "boolean"
          ? initialData.isPublic
          : typeof defaultIsPublic === "boolean"
          ? defaultIsPublic
          : false,
    },
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        location: initialData.location || "",
        startDate: initialData.startDate
          ? initialData.startDate.slice(0, 16)
          : "",
        endDate: initialData.endDate ? initialData.endDate.slice(0, 16) : "",
        categoryIds: initialData.categories
          ? initialData.categories.map((cat) => cat.id)
          : [],
        creatorId:
          isEditMode && initialData.organizer
            ? initialData.organizer.id
            : currentUserId,
        isPublic:
          typeof initialData.isPublic === "boolean"
            ? initialData.isPublic
            : typeof defaultIsPublic === "boolean"
            ? defaultIsPublic
            : false,
      });
    }
  }, [initialData, isEditMode, form, currentUserId, defaultIsPublic]);

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const timeInvalid =
    startDate && endDate && new Date(endDate) <= new Date(startDate);

  const handleFormSubmit = async (values: EventFormValues) => {
    if (timeInvalid) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại!");
      } else {
        toast.error("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
      }
    }
  };

  // Xác định hiển thị phần chọn người tạo
  let creatorField = null;
  if (isEditMode) {
    // Chế độ sửa: chỉ hiển thị tên người tạo, hidden input cho id
    creatorField = (
      <div className="space-y-2">
        <Label>Người tạo</Label>
        <Input value={creatorName || currentUsername} readOnly disabled />
        <input
          type="hidden"
          {...form.register("creatorId")}
          value={defaultCreatorId}
        />
      </div>
    );
  } else if (currentUserRole === "ROLE_ADMIN") {
    // ADMIN: chọn moderator
    creatorField = (
      <div className="space-y-2">
        <Label htmlFor="creatorId">Người tạo (Moderator)</Label>
        <select
          id="creatorId"
          {...form.register("creatorId")}
          className="w-full border rounded px-2 py-2"
          disabled={isLoading}
          aria-invalid={!!form.formState.errors.creatorId}
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
  } else {
    // MODERATOR: ẩn input, chỉ show tên mình
    creatorField = (
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
  }

  // Danh mục nhiều chọn (multi-select)
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    form.setValue("categoryIds", selectedOptions, { shouldValidate: true });
  };

  const selectedCategoryIds = form.watch("categoryIds") ?? [];

  return (
    <Card
      className="w-full max-w-2xl mx-auto"
      aria-labelledby="event-form-title"
    >
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        aria-describedby="event-form-desc"
      >
        <CardHeader>
          <CardTitle
            id="event-form-title"
            className="text-2xl flex items-center gap-2"
          >
            {isEditMode ? (
              <CalendarCheck2 className="h-6 w-6" aria-hidden="true" />
            ) : (
              <PlusCircle className="h-6 w-6" aria-hidden="true" />
            )}
            {isEditMode
              ? `Sửa sự kiện: ${initialData?.title || ""}`
              : "Thêm sự kiện mới"}
          </CardTitle>
          <CardDescription id="event-form-desc">
            {isEditMode
              ? "Cập nhật thông tin chi tiết cho sự kiện này."
              : "Điền thông tin để tạo sự kiện mới."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề sự kiện</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề"
              required
              {...form.register("title")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.title}
              aria-describedby={
                form.formState.errors.title ? "title-error" : undefined
              }
              tabIndex={0}
            />
            {form.formState.errors.title && (
              <p
                className="text-xs text-red-600"
                id="title-error"
                role="alert"
                aria-live="polite"
              >
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              placeholder="Nhập mô tả"
              {...form.register("description")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.description}
              aria-describedby={
                form.formState.errors.description
                  ? "description-error"
                  : undefined
              }
              tabIndex={0}
            />
            {form.formState.errors.description && (
              <p
                className="text-xs text-red-600"
                id="description-error"
                role="alert"
                aria-live="polite"
              >
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Địa điểm</Label>
            <Input
              id="location"
              placeholder="Nhập địa điểm"
              {...form.register("location")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.location}
              aria-describedby={
                form.formState.errors.location ? "location-error" : undefined
              }
              tabIndex={0}
            />
            {form.formState.errors.location && (
              <p
                className="text-xs text-red-600"
                id="location-error"
                role="alert"
                aria-live="polite"
              >
                {form.formState.errors.location.message}
              </p>
            )}
          </div>
          {/* Category - Multi select */}
          <div className="space-y-2">
            <Label htmlFor="categoryIds">Danh mục</Label>
            <select
              id="categoryIds"
              multiple
              value={selectedCategoryIds}
              onChange={handleCategoryChange}
              disabled={isLoading}
              className="w-full border rounded px-2 py-2"
              aria-invalid={!!form.formState.errors.categoryIds}
              size={Math.min(5, categoryOptions.length)}
            >
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều danh mục.
            </p>
            {form.formState.errors.categoryIds && (
              <p className="text-xs text-red-600 mt-1">
                {form.formState.errors.categoryIds.message as string}
              </p>
            )}
          </div>
          {/* Creator */}
          {creatorField}
          {/* Start/End time */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="startDate">Bắt đầu</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...form.register("startDate")}
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.startDate}
                aria-describedby={
                  form.formState.errors.startDate
                    ? "startDate-error"
                    : undefined
                }
                tabIndex={0}
              />
              {form.formState.errors.startDate && (
                <p className="text-xs text-red-600 mt-1" id="startDate-error">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Kết thúc</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...form.register("endDate")}
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.endDate}
                aria-describedby={
                  form.formState.errors.endDate ? "endDate-error" : undefined
                }
                tabIndex={0}
              />
              {form.formState.errors.endDate && (
                <p className="text-xs text-red-600 mt-1" id="endDate-error">
                  {form.formState.errors.endDate.message}
                </p>
              )}
              {timeInvalid && (
                <p className="text-xs text-red-600 mt-1">
                  Thời gian kết thúc phải sau thời gian bắt đầu!
                </p>
              )}
            </div>
            <Controller
              control={form.control}
              name="isPublic"
              render={({ field: { value, onChange, ...field } }) => (
                <div className="space-y-2">
                  <Label htmlFor="isPublic">Công khai sự kiện?</Label>
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4"
                    disabled={isLoading}
                    {...field}
                  />
                </div>
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            asChild
            type="button"
            tabIndex={0}
            aria-disabled={isLoading}
            disabled={isLoading}
          >
            <Link href="/admin/events">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Quay lại
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={isLoading || Boolean(timeInvalid)}
            aria-busy={isLoading}
            aria-disabled={isLoading || Boolean(timeInvalid)}
            tabIndex={0}
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

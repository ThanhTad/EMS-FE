// components/admin/venues/VenueForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Venue } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

const venueSchema = z.object({
  name: z.string().min(3, "Tên phải có ít nhất 3 ký tự.").max(255),
  address: z.string().max(255).or(z.literal("")), // Cho phép chuỗi rỗng
  city: z.string().max(100).or(z.literal("")),
  country: z.string().max(100).or(z.literal("")),
});

export type VenueFormValues = z.infer<typeof venueSchema>;

interface VenueFormProps {
  initialData?: Venue | null;
  onSubmit: (data: VenueFormValues) => void; // <-- THAY ĐỔI 1: Chỉ cần gọi, không cần promise
  isLoading: boolean; // <-- THAY ĐỔI 2: Nhận isLoading từ cha
  isEditMode: boolean;
}

export const VenueForm: React.FC<VenueFormProps> = ({
  initialData,
  onSubmit,
  isLoading, // Nhận từ props
  isEditMode,
}) => {
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      country: initialData?.country || "",
    },
  });

  // KHÔNG CẦN handleFormSubmit phức tạp nữa, chỉ cần gọi onSubmit
  return (
    <Card className="w-full max-w-2xl mx-auto">
      {/* THAY ĐỔI 3: form.handleSubmit sẽ trực tiếp gọi prop onSubmit */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin />
            {isEditMode ? "Sửa địa điểm" : "Tạo địa điểm mới"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? `Cập nhật thông tin cho địa điểm "${initialData?.name}"`
              : "Điền thông tin để tạo một địa điểm tổ chức sự kiện."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ... (Nội dung form không đổi) ... */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên địa điểm *</Label>
            <Input
              id="name"
              placeholder="Ví dụ: Sân vận động Mỹ Đình"
              {...form.register("name")}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-red-600 text-xs mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Textarea
              id="address"
              placeholder="Ví dụ: 1 Lê Đức Thọ, Mỹ Đình, Nam Từ Liêm"
              {...form.register("address")}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Thành phố</Label>
              <Input
                id="city"
                placeholder="Ví dụ: Hà Nội"
                {...form.register("city")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Quốc gia</Label>
              <Input
                id="country"
                placeholder="Ví dụ: Việt Nam"
                {...form.register("country")}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild type="button" disabled={isLoading}>
            <Link href="/admin/venues">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Lưu thay đổi" : "Tạo địa điểm"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

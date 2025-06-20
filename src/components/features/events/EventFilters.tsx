"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/shared/DatePickerWithRange";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getCategories } from "@/lib/api"; // Giả sử bạn có hàm này để lấy categories động
import { Category, DateRange } from "@/types";
import { useDebouncedCallback } from "use-debounce";

export default function EventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State để lưu danh sách categories từ API
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    // Gọi API để lấy danh sách categories
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories({ size: 100 }); // Lấy nhiều
        setCategories(categoriesData.content);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Hàm để cập nhật URL một cách an toàn
  const updateURL = (newParams: URLSearchParams) => {
    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`);
    });
  };

  // Debounce việc cập nhật URL khi người dùng gõ vào ô Input
  const debouncedUpdateURL = useDebouncedCallback(updateURL, 500);

  // === Xử lý Category (Checkbox) ===
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    // Lấy tất cả category hiện có
    const selected = params.getAll("category");

    if (checked) {
      // Thêm category mới nếu chưa có
      if (!selected.includes(categoryId)) {
        params.append("category", categoryId);
      }
    } else {
      // Xóa category đã bỏ chọn
      params.delete("category"); // Xóa hết key 'category'
      selected
        .filter((id) => id !== categoryId) // Lọc bỏ id đã uncheck
        .forEach((id) => params.append("category", id)); // Thêm lại những cái còn lại
    }
    params.delete("page");
    updateURL(params);
  };

  // === Xử lý Date Range ===
  const handleDateChange = (date: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (date?.from) {
      params.set("start", date.from.toISOString().split("T")[0]); // Gửi YYYY-MM-DD
    } else {
      params.delete("start");
    }

    if (date?.to) {
      params.set("end", date.to.toISOString().split("T")[0]); // Gửi YYYY-MM-DD
    } else {
      params.delete("end");
    }
    params.delete("page");
    updateURL(params);
  };

  // === Xử lý Location (Input với Debounce) ===
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("location", value.trim()); // Giả sử backend lọc theo param 'location'
    } else {
      params.delete("location");
    }
    params.delete("page");
    debouncedUpdateURL(params);
  };

  // === Xử lý Checkbox khác (ví dụ: isFree) ===
  const handleIsFreeChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set("isFree", "true"); // Giả sử backend lọc theo param 'isFree'
    } else {
      params.delete("isFree");
    }
    params.delete("page");
    updateURL(params);
  };

  const resetFilters = () => {
    router.push(pathname); // Đơn giản là điều hướng về trang gốc không có params
  };

  return (
    <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl dark:text-white">
          Bộ lọc sự kiện
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Danh mục (sử dụng Checkbox) */}
        <div className="space-y-2">
          <Label className="text-gray-800 dark:text-gray-100">Danh mục</Label>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={cat.id}
                  checked={searchParams.getAll("category").includes(cat.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(cat.id, !!checked)
                  }
                  disabled={isPending}
                />
                <Label htmlFor={cat.id} className="cursor-pointer">
                  {cat.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Khoảng ngày */}
        <div className="space-y-2">
          <Label className="text-gray-800 dark:text-gray-100">
            Khoảng ngày
          </Label>
          <DatePickerWithRange
            onDateChange={handleDateChange}
            // Lấy giá trị mặc định từ URL để hiển thị lại khi tải lại trang
            date={{
              from: searchParams.get("start")
                ? new Date(searchParams.get("start")!)
                : undefined,
              to: searchParams.get("end")
                ? new Date(searchParams.get("end")!)
                : undefined,
            }}
            disabled={isPending}
          />
        </div>

        {/* Địa điểm */}
        <div className="space-y-2">
          <Label
            htmlFor="location"
            className="text-gray-800 dark:text-gray-100"
          >
            Địa điểm
          </Label>
          <Input
            id="location"
            placeholder="Nhập thành phố, địa điểm..."
            onChange={handleLocationChange}
            defaultValue={searchParams.get("location") || ""}
            disabled={isPending}
          />
        </div>

        {/* Miễn phí */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="free-events"
            checked={searchParams.get("isFree") === "true"}
            onCheckedChange={(checked) => handleIsFreeChange(!!checked)}
            disabled={isPending}
          />
          <Label
            htmlFor="free-events"
            className="cursor-pointer text-gray-800 dark:text-gray-100"
          >
            Chỉ hiển thị sự kiện miễn phí
          </Label>
        </div>

        {/* Nút Reset */}
        <div className="flex flex-col space-y-2 pt-4">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="dark:border-gray-600 dark:text-gray-100"
            disabled={isPending}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

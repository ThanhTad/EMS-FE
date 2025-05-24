// components/shared/EventFilters.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/shared/DatePickerWithRange";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";

const categories = [
  { id: "cat1", name: "Công nghệ" },
  { id: "cat2", name: "Âm nhạc" },
  { id: "cat3", name: "Thể thao" },
  { id: "cat4", name: "Du lịch" },
  { id: "cat5", name: "Giáo dục" },
];

export default function EventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from && to) {
      try {
        return { from: new Date(from), to: new Date(to) };
      } catch {
        return undefined;
      }
    }
    return undefined;
  });
  const [isFree, setIsFree] = useState(searchParams.get("isFree") === "true");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const handleFilterChange = () => {
    const params = new URLSearchParams(searchParams);

    if (selectedCategory && selectedCategory !== "all")
      params.set("category", selectedCategory);
    else params.delete("category");

    if (selectedDateRange?.from)
      params.set("from", selectedDateRange.from.toISOString());
    else params.delete("from");

    if (selectedDateRange?.to)
      params.set("to", selectedDateRange.to.toISOString());
    else params.delete("to");

    if (isFree) params.set("isFree", "true");
    else params.delete("isFree");

    if (location.trim()) params.set("location", location.trim());
    else params.delete("location");

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedDateRange(undefined);
    setIsFree(false);
    setLocation("");
    router.push(pathname);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl dark:text-white">
          Bộ lọc sự kiện
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Danh mục */}
        <div className="space-y-2">
          <Label
            htmlFor="category"
            className="text-gray-800 dark:text-gray-100"
          >
            Danh mục
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger
              id="category"
              className="dark:bg-gray-700 dark:text-white"
            >
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Khoảng ngày */}
        <div className="space-y-2">
          <Label className="text-gray-800 dark:text-gray-100">
            Khoảng ngày
          </Label>
          <DatePickerWithRange
            date={selectedDateRange}
            onDateChange={setSelectedDateRange}
            className="dark:bg-gray-700 dark:text-white"
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Miễn phí */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="free-events"
            checked={isFree}
            onCheckedChange={(checked) => setIsFree(checked as boolean)}
            className="dark:ring-offset-gray-900"
          />
          <Label
            htmlFor="free-events"
            className="cursor-pointer text-gray-800 dark:text-gray-100"
          >
            Chỉ hiển thị sự kiện miễn phí
          </Label>
        </div>

        {/* Nút */}
        <div className="flex flex-col space-y-2 pt-4">
          <Button
            className="dark:bg-primary dark:text-white"
            onClick={handleFilterChange}
          >
            Áp dụng lọc
          </Button>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="dark:border-gray-600 dark:text-gray-100"
          >
            Xóa bộ lọc
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// components/shared/EventSort.tsx
"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const sortOptions = [
  { value: "date", label: "Mới nhất" },
  { value: "popularity", label: "Phổ biến nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
];

export default function EventSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "date";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "date") params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-gray-100">
      <Label
        htmlFor="sort-events"
        className="whitespace-nowrap dark:text-gray-100"
      >
        Sắp xếp theo:
      </Label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger
          id="sort-events"
          className="w-[180px] bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          aria-label="Chọn cách sắp xếp sự kiện"
        >
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

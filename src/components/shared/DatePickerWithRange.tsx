// components/shared/DatePickerWithRange.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  disabled?: boolean;
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
  disabled = false,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white border border-gray-200 text-gray-900",
              "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100",
              !date && "text-muted-foreground dark:text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/y", { locale: vi })} -{" "}
                  {format(date.to, "dd/MM/y", { locale: vi })}
                </>
              ) : (
                format(date.from, "dd/MM/y", { locale: vi })
              )
            ) : (
              <span>Chọn khoảng ngày</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(
            "w-auto p-0 bg-white",
            "dark:bg-gray-800 dark:text-gray-100"
          )}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={vi}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

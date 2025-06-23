// components/admin/tickets/TicketsFilter.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Định nghĩa props để nhận các lựa chọn cho dropdown
interface Option {
  value: string;
  label: string;
}

interface TicketsFilterProps {
  eventOptions: Option[];
  statusOptions: Option[];
}

export function TicketsFilter({
  eventOptions,
  statusOptions,
}: TicketsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lấy giá trị filter hiện tại từ URL
  const currentEventId = searchParams.get("eventId") || "";
  const currentStatusId = searchParams.get("statusId") || "";

  // Hàm helper để cập nhật URL params
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Khi thay đổi filter, luôn reset về trang đầu tiên
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {/* Filter theo Sự kiện */}
      <div>
        <label
          htmlFor="event-filter"
          className="block text-sm font-medium mb-1"
        >
          Sự kiện
        </label>
        <select
          id="event-filter"
          className="border rounded px-3 py-2 bg-background"
          value={currentEventId}
          onChange={(e) => handleFilterChange("eventId", e.target.value)}
        >
          <option value="">Tất cả sự kiện</option>
          {eventOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filter theo Trạng thái */}
      <div>
        <label
          htmlFor="status-filter"
          className="block text-sm font-medium mb-1"
        >
          Trạng thái
        </label>
        <select
          id="status-filter"
          className="border rounded px-3 py-2 bg-background"
          value={currentStatusId}
          onChange={(e) => handleFilterChange("statusId", e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

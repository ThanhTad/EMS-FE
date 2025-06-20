// app/(main)/events/[slug]/page.tsx

import { getEventBySlug, getTicketsByEventId } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, TimerIcon, UserIcon } from "lucide-react";
import ImageCarousel from "@/components/shared/ImageCarousel";
import TicketSelector from "@/components/features/tickets/TicketSelector"; // Đường dẫn mới
import { Ticket } from "@/types";
import { notFound } from "next/navigation";
import EventDiscussionSection from "@/components/features/events/EventDiscussionSection";

// Bỏ isPromise, Next.js 14 đã xử lý params tốt hơn
interface EventDetailPageProps {
  params: { slug: string };
}

const fallbackImages = [
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
];

function formatDateTimeToString(datetime?: string): string {
  if (!datetime) return "";
  const { date, time } = formatDateTime(datetime);
  return `${date}${time ? ` lúc ${time}` : ""}`;
}

function getDurationMinutes(
  startDate?: string,
  endDate?: string
): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diffMs = end - start;
  if (isNaN(diffMs) || diffMs <= 0) return null;
  return Math.round(diffMs / 60000);
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = params;
  if (!slug) return notFound();

  const event = await getEventBySlug(slug).catch(() => null);

  if (!event) {
    return notFound();
  }

  // LẤY DANH SÁCH TICKET CỦA EVENT
  let tickets: Ticket[] = [];
  try {
    const paginated = await getTicketsByEventId(event.id, {
      page: 0,
      size: 100, // Lấy tối đa 100 loại vé
    });
    tickets = paginated.content ?? [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vé:", error);
    tickets = [];
  }

  const images = event.coverImageUrl ? [event.coverImageUrl] : [];
  if (images.length < 2) {
    images.push(...fallbackImages.slice(0, 2 - images.length));
  }

  const durationMinutes = getDurationMinutes(event.startDate, event.endDate);
  const displayDuration = durationMinutes
    ? `${durationMinutes} phút`
    : "Chưa xác định";

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-5 gap-8 text-gray-900 dark:text-gray-100">
      {/* Cột trái - Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <ImageCarousel images={images} alt={event.title ?? "Event Images"} />

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {event.categories?.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight dark:text-white">
            {event.title ?? "Không có tiêu đề"}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 border-t border-b py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Tổ chức bởi</p>
              <p>
                {event.creator?.fullName ??
                  event.creator?.username ??
                  "Không rõ"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Địa điểm</p>
              <p>{event.venue?.name ?? "Chưa xác định"}</p>
              <p className="text-xs text-gray-500">{event.venue?.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Bắt đầu</p>
              <p>{formatDateTimeToString(event.startDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TimerIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Thời lượng</p>
              <p>{displayDuration}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Mô tả sự kiện</h2>
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: event.description ?? "Không có mô tả.",
            }}
          />
        </div>

        {/* Phần bình luận */}
        <EventDiscussionSection eventId={event.id} />
      </div>

      {/* Cột phải - Ticket Selector và thông tin thêm */}
      <div className="lg:col-span-2 space-y-4 lg:sticky top-24 self-start">
        <TicketSelector tickets={tickets} event={event} />
      </div>
    </div>
  );
}

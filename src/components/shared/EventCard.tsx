import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
// FIX 2: Import Badge từ UI library, không phải từ icon library
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { Event } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  className?: string;
}

// Giả sử các status này khớp với dữ liệu từ bảng status_codes trong DB
enum EventStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  ENDED = "ENDED",
}

const statusMap = {
  [EventStatus.UPCOMING]: {
    label: "Sắp diễn ra",
    color: "bg-blue-500 dark:bg-blue-600",
  },
  [EventStatus.ONGOING]: {
    label: "Đang diễn ra",
    color: "bg-green-500 dark:bg-green-600",
  },
  [EventStatus.ENDED]: {
    label: "Đã kết thúc",
    color: "bg-gray-400 dark:bg-gray-600",
  },
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { date: formattedDate, time: formattedTime } = formatDateTime(
    event.startDate
  );

  // Kiểm tra an toàn hơn, phòng trường hợp event.status không tồn tại
  const eventStatusKey = event.status?.status as EventStatus | undefined;
  const status = eventStatusKey ? statusMap[eventStatusKey] : null;

  return (
    // IMPROVEMENT 3: Sử dụng slug cho URL, dự phòng bằng id
    <Link href={`/events/${event.slug || event.id}`} className="block group">
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-card hover:shadow-xl group-hover:scale-[1.02]">
        <CardHeader className="relative p-0">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={event.coverImageUrl || "/imgs/placeholder-image.jpg"}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </AspectRatio>
          {status && (
            <div
              className="absolute px-2 py-1 text-xs font-semibold text-white rounded-md top-3 left-3"
              style={{ backgroundColor: status.color }}
            >
              {status.label}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex flex-col flex-grow p-4 space-y-3">
          {event.categories && event.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.categories.map((cate) => (
                // FIX 2: Sử dụng variant của component Badge
                <Badge
                  key={cate.id}
                  variant="secondary"
                  className="font-medium"
                >
                  {cate.name}
                </Badge>
              ))}
            </div>
          )}

          <CardTitle className="flex-grow text-lg font-bold leading-tight text-gray-900 transition-colors dark:text-white group-hover:text-primary dark:group-hover:text-primary-light">
            {event.title}
          </CardTitle>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>
                {formattedDate} {formattedTime && `• ${formattedTime}`}
              </span>
            </div>

            {/* FIX 1: Sử dụng event.venue.name thay vì event.location */}
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{event.venue.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;

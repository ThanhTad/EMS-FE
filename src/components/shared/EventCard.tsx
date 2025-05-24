import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge, CalendarDays, MapPin } from "lucide-react";
import { Event } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  className?: string;
}

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
  const status = event.status
    ? statusMap[event.status.status as EventStatus]
    : null;

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-lg group-hover:scale-[1.02] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
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
            <div className="absolute top-2 left-2">
              <span
                className={`text-xs text-white px-2 py-1 rounded ${status.color}`}
              >
                {status.label}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-2">
          {/* Sửa lại phần hiển thị category để hỗ trợ nhiều category */}
          {event.categories && event.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.categories.map((cate) => (
                <Badge
                  key={cate.id}
                  className="dark:border-gray-600 dark:text-gray-100"
                >
                  {cate.name}
                </Badge>
              ))}
            </div>
          )}

          <CardTitle className="text-lg font-semibold leading-tight text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary">
            {event.title}
          </CardTitle>

          <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground gap-1.5">
            <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span>
              {formattedDate} {formattedTime && `- ${formattedTime}`}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground gap-1.5">
            <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span>{event.location}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;

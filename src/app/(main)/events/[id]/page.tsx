import { getEventById } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, TimerIcon, UserIcon } from "lucide-react";
import ImageCarousel from "@/components/shared/ImageCarousel";
import MapEmbed from "@/components/shared/MapEmbed";

interface EventDetailPageProps {
  params: { id: string };
}

const mockImages = [
  "https://source.unsplash.com/random/1200x600?concert",
  "https://source.unsplash.com/random/1200x600?event",
  "https://source.unsplash.com/random/1200x600?crowd",
];

function formatDateTimeToString(datetime: string): string {
  const { date, time } = formatDateTime(datetime);
  return `${date}${time ? " " + time : ""}`;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const eventDetails = await getEventById(params.id);

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-900 dark:text-gray-100">
      {/* Left column - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <ImageCarousel images={mockImages} alt={eventDetails.title} />

        <h1 className="text-3xl font-bold dark:text-white">
          {eventDetails.title}
        </h1>

        <div className="flex flex-wrap gap-2">
          {eventDetails.categories && eventDetails.categories.length > 0 && (
            <>
              {eventDetails.categories.map((category) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="dark:border-gray-600 dark:text-gray-100"
                >
                  {category.name}
                </Badge>
              ))}
            </>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span>By {eventDetails.organizer.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span>{formatDateTimeToString(eventDetails.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TimerIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span>15 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span>{eventDetails.location}</span>
          </div>
        </div>

        <div className="prose max-w-none dark:prose-invert">
          {eventDetails.description}
        </div>
      </div>

      {/* Right column - Map or Extra Info */}
      <div className="space-y-4">
        <MapEmbed location={eventDetails.location} />
        <div className="p-4 bg-muted/40 dark:bg-muted/60 rounded-lg shadow-sm space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Thời gian bắt đầu
          </div>
          <div className="font-medium dark:text-gray-100">
            {formatDateTimeToString(eventDetails.startDate)}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            Thời lượng
          </div>
          <div className="font-medium dark:text-gray-100">15 phút</div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            Địa điểm
          </div>
          <div className="font-medium dark:text-gray-100">
            {eventDetails.location}
          </div>
        </div>

        <Button className="w-full dark:bg-primary dark:text-white">
          Đặt vé
        </Button>
      </div>
    </div>
  );
}

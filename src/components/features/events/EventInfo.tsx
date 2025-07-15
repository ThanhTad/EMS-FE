"use client";
import { EventTicketingDetails } from "@/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import { Calendar, MapPin, UserCircle } from "lucide-react";

interface EventInfoProps {
  data: EventTicketingDetails;
}

const InfoRow: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <div className="flex items-start gap-3">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div>{children}</div>
  </div>
);

const EventInfo: React.FC<EventInfoProps> = ({ data }) => (
  <div className="space-y-6">
    {data.coverImageUrl && (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src={data.coverImageUrl}
          alt={data.eventTitle}
          layout="fill"
          objectFit="cover"
        />
      </div>
    )}
    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
      {data.eventTitle}
    </h1>
    <div className="space-y-3 text-sm lg:text-base">
      <InfoRow icon={<Calendar size={18} />}>
        <p className="font-semibold">
          {format(new Date(data.eventStartDate), "HH:mm, EEEE, dd/MM/yyyy", {
            locale: vi,
          })}
        </p>
      </InfoRow>
      <InfoRow icon={<MapPin size={18} />}>
        <div>
          <p className="font-semibold">{data.venue?.name}</p>
          <p className="text-muted-foreground">{data.venue?.address}</p>
        </div>
      </InfoRow>
      {data.creator && (
        <InfoRow icon={<UserCircle size={18} />}>
          <p>
            Đơn vị tổ chức:{" "}
            <span className="font-semibold">{data.creator.fullName}</span>
          </p>
        </InfoRow>
      )}
    </div>
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <p>{data.eventDescription}</p>
    </div>
  </div>
);

export default EventInfo;

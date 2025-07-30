//app/events/[slug]/EventDetailClient.tsx
"use client";

import { EventTicketingDetails } from "@/types";
import useSWR from "swr";
import EventInfo from "@/components/features/events/EventInfo";
import TicketingInterface from "@/components/features/tickets/TicketInterface";
import { getEventTicketingBySlug } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/stores/cartStore";
import { useEffect } from "react";

interface EventDetailClientProps {
  initialData: EventTicketingDetails;
}

const fetcher = (slug: string) => getEventTicketingBySlug(slug);

const EventDetailClient: React.FC<EventDetailClientProps> = ({
  initialData,
}) => {
  const { data, error, isLoading } = useSWR(initialData.slug, fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: true,
    dedupingInterval: 60000,
  });

  const startNewCart = useCartStore((state) => state.startNewCart);

  useEffect(() => {
    // "Ra lệnh" cho store và truyền vào dữ liệu `EventTicketingDetails`
    // Store sẽ tự biết cách "đọc" và xử lý nó.
    if (data) {
      startNewCart(data);
    }
  }, [data, startNewCart]);

  if (isLoading && !data) return <EventDetailSkeleton />;

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <h2 className="text-2xl font-bold">Đã xảy ra lỗi</h2>
        <p>Không thể tải dữ liệu sự kiện. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-1">
        <EventInfo data={data} />
      </div>
      <div className="lg:col-span-2">
        <TicketingInterface data={data} />
      </div>
    </div>
  );
};

const EventDetailSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
    <div className="lg:col-span-1 space-y-4">
      <Skeleton className="w-full aspect-video rounded-lg" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-5/6" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="lg:col-span-2 space-y-4">
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="w-full aspect-video rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  </div>
);

export default EventDetailClient;

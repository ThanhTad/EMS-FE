import { Metadata } from "next";
import EventCard from "@/components/shared/EventCard";
import PaginationControls from "@/components/shared/PaginationControls";
import EventFilters from "@/components/features/EventFilters";
import EventSort from "@/components/features/EventSort";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { JSX, Suspense } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  getEvents,
  searchEvents,
  getEventsByCategoryId,
  getEventsByCreatorId,
  getEventsByStatusId,
  getEventsByDateRange,
} from "@/lib/api";
import { Event, Paginated } from "@/types";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export const metadata: Metadata = {
  title: "Khám phá Sự kiện | EMS",
  description: "Tìm kiếm và khám phá các sự kiện hấp dẫn.",
};

async function EventListContent({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<JSX.Element> {
  const Page = Number(searchParams.Page ?? "1");
  const size = 6;
  const sortParam = Array.isArray(searchParams.sort)
    ? searchParams.sort.join(",")
    : searchParams.sort ?? "startDate,asc";

  const keyword = searchParams.keyword;
  const categoryParam = searchParams.category;
  const creatorParam = searchParams.creator;
  const statusParam = searchParams.status;
  const startParam = searchParams.start;
  const endParam = searchParams.end;

  let eventsData: Paginated<Event>;

  if (keyword) {
    eventsData = await searchEvents({
      page: Page - 1,
      size,
      sort: sortParam,
      keyword: Array.isArray(keyword) ? keyword.join(",") : keyword,
    });
  } else if (categoryParam && categoryParam !== "all") {
    const categoryId = Array.isArray(categoryParam)
      ? categoryParam[0]
      : categoryParam;
    eventsData = await getEventsByCategoryId(categoryId, {
      page: Page - 1,
      size,
      sort: sortParam,
    });
  } else if (creatorParam) {
    const creatorId = Array.isArray(creatorParam)
      ? creatorParam[0]
      : creatorParam;
    eventsData = await getEventsByCreatorId(creatorId, {
      page: Page - 1,
      size,
      sort: sortParam,
    });
  } else if (statusParam) {
    const statusId = Number(
      Array.isArray(statusParam) ? statusParam[0] : statusParam
    );
    eventsData = await getEventsByStatusId(statusId, {
      page: Page - 1,
      size,
      sort: sortParam,
    });
  } else if (startParam && endParam) {
    const start = Array.isArray(startParam) ? startParam[0] : startParam;
    const end = Array.isArray(endParam) ? endParam[0] : endParam;
    eventsData = await getEventsByDateRange({
      page: Page - 1,
      size,
      sort: sortParam,
      start,
      end,
    });
  } else {
    eventsData = await getEvents({
      page: Page - 1,
      size,
      sort: sortParam,
    });
  }

  const {
    content: events,
    totalPages,
    totalElements,
    numberOfElements,
  } = eventsData;

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
        <p className="text-sm text-muted-foreground">
          Hiển thị {numberOfElements} trên tổng số {totalElements} sự kiện
        </p>
        <EventSort />
      </div>
      <Separator className="mb-8" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {events.length > 0 ? (
          events.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-10">
            Không tìm thấy sự kiện nào phù hợp với bộ lọc của bạn.
          </p>
        )}
      </div>

      <div className="mt-10">
        <PaginationControls currentPage={Page} totalPages={totalPages} />
      </div>
    </>
  );
}

function EventListSkeleton() {
  const skeletonCount = 6;
  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
        <Skeleton className="h-5 w-48" />
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>
      <Separator className="mb-8" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="p-0">
              <Skeleton className="aspect-[16/9] w-full" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-5 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-10">
        <Skeleton className="h-10 w-64 mx-auto" />
      </div>
    </>
  );
}

export default function EventsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams || {};

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">
        Khám phá sự kiện
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <EventFilters />
        </aside>

        <section className="lg:col-span-3">
          <Suspense fallback={<EventListSkeleton />}>
            <EventListContent searchParams={params} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

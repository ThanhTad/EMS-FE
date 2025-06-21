//app/(main)/events/EventsPageContent.tsx
import EventCard from "@/components/shared/EventCard";
import PaginationControls from "@/components/shared/PaginationControls";
import EventFilters from "@/components/features/events/EventFilters";
import EventSort from "@/components/features/events/EventSort";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { JSX, Suspense } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getEvents, searchEvents } from "@/lib/api";
import { EventSearchParams } from "@/types";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

async function EventListContent({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<JSX.Element> {
  const page = Number(searchParams.page ?? "1");
  const size = 6;
  const sortParam = Array.isArray(searchParams.sort)
    ? (searchParams.sort as string[]).join(",")
    : searchParams.sort ?? "startDate,asc";

  // 1. Xây dựng object filters với kiểu EventSearchParams
  const filters: EventSearchParams = {
    page: page - 1,
    size,
    sort: sortParam,
  };

  const getSingleParam = (
    param: string | string[] | undefined
  ): string | undefined => {
    return Array.isArray(param) ? param[0] : param;
  };

  const keyword = getSingleParam(searchParams.keyword);
  if (keyword) {
    filters.keyword = keyword;
  }

  const categoryParam = searchParams.category;
  if (categoryParam) {
    if (Array.isArray(categoryParam)) {
      // Nếu nó đã là mảng, gán trực tiếp
      filters.categoryIds = categoryParam;
    } else if (typeof categoryParam === "string" && categoryParam !== "all") {
      // Nếu là chuỗi, chuyển thành mảng một phần tử
      filters.categoryIds = [categoryParam];
    }
  }

  const status = getSingleParam(searchParams.status);
  if (status) {
    const statusId = parseInt(status, 10);
    if (!isNaN(statusId)) {
      filters.statusId = statusId;
    }
  }

  const start = getSingleParam(searchParams.start);
  if (start) {
    filters.start = start;
  }

  const end = getSingleParam(searchParams.end);
  if (end) {
    filters.end = end;
  }

  // 2. Chỉ cần một lời gọi API duy nhất
  // Chúng ta sẽ kiểm tra xem có bộ lọc nào được áp dụng không.
  // Nếu có (ngoài page, size, sort), chúng ta dùng searchEvents. Nếu không, dùng getEvents.
  const hasActiveFilters =
    "keyword" in filters ||
    "categoryId" in filters ||
    "statusId" in filters ||
    "start" in filters ||
    "end" in filters;
  const eventsData = await (hasActiveFilters
    ? searchEvents(filters)
    : getEvents(filters));
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
        <PaginationControls currentPage={page} totalPages={totalPages} />
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

export default async function EventsPageContent({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const params: SearchParams = isPromise<SearchParams>(searchParams)
    ? await searchParams
    : searchParams || {};
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

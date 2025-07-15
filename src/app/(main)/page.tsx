// app/(main)/page.tsx

import { getEvents } from "@/lib/api";
import HomePageClient from "@/components/main/HomePageClient";

async function getHomePageData() {
  try {
    // We fetch the hero event and trending events in parallel for better performance.
    const [heroEventData, trendingEventsData] = await Promise.all([
      // Hero Event: The most recently created event.
      getEvents({ page: 0, size: 1, sort: "createdAt,desc" }),
      getEvents({ page: 0, size: 3, sort: "startDate,asc" }),
    ]);

    const heroEvent = heroEventData.content[0];
    const trendingEvents = trendingEventsData.content;

    // Fallback: If there's no specific hero event, use the first trending event as a hero.
    if (!heroEvent && trendingEvents.length > 0) {
      return { heroEvent: trendingEvents[0], trendingEvents };
    }

    return { heroEvent, trendingEvents };
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    // Return a default state in case of an API error to prevent the page from crashing.
    return { heroEvent: null, trendingEvents: [] };
  }
}

/**
 * The main server component for the home page.
 * It's responsible for data fetching and passing data down to the client component.
 */
export default async function HomePage() {
  const { heroEvent, trendingEvents } = await getHomePageData();

  // If no hero event could be found at all, display an error message.
  // This is a critical data failure.
  if (!heroEvent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold">Không thể tải trang</h2>
        <p className="mt-2 text-muted-foreground">
          Đã có lỗi xảy ra khi tải dữ liệu sự kiện. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  return (
    <HomePageClient heroEvent={heroEvent} trendingEvents={trendingEvents} />
  );
}

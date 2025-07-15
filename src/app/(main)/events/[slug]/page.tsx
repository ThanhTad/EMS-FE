//src/app/events/[slug]/page.tsx
import { getEventTicketingBySlug } from "@/lib/api";
import { Metadata } from "next";
import EventDetailClient from "./EventDetailClient";

interface EventPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const data = await getEventTicketingBySlug(slug);
    return {
      title: data.eventTitle,
      description: data.eventDescription,
      openGraph: {
        title: data.eventTitle,
        description: data.eventDescription || "",
        images: data.coverImageUrl ? [data.coverImageUrl] : [],
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching event data:", error.message);
    }
    return { title: "Không tìm thấy sự kiện" };
  }
}

const EventPage = async ({ params }: EventPageProps) => {
  try {
    const { slug } = await params;
    const initialData = await getEventTicketingBySlug(slug);
    return (
      <main className="container mx-auto py-8 px-4">
        <EventDetailClient initialData={initialData} />
      </main>
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching event data:", error.message);
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-xl mt-4 text-muted-foreground">
          Không tìm thấy sự kiện bạn yêu cầu.
        </p>
        <p className="text-sm mt-2 text-muted-foreground">
          Sự kiện có thể đã kết thúc hoặc không tồn tại.
        </p>
      </div>
    );
  }
};

export default EventPage;

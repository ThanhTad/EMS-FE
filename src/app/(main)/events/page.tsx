//app/(main)/events/page.tsx
import { Metadata } from "next";
import EventsPageContent from "../../../components/main/EventsPageContent";

export const metadata: Metadata = {
  title: "Khám phá Sự kiện | EMS",
  description: "Tìm kiếm và khám phá các sự kiện hấp dẫn.",
};

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: PageProps) {
  const params = searchParams || {};
  return <EventsPageContent searchParams={params} />;
}

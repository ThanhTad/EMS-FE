// app/(main)/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Search,
  Sparkles,
  Ticket,
  Users,
  MapPin,
  CalendarDays,
} from "lucide-react";
import EventCard from "@/components/shared/EventCard";
import SectionWrapper from "@/components/shared/SectionWrapper";
import CategoryHighlightCard from "@/components/shared/CategoryHighlightCard";
import HomeSearch from "@/components/shared/HomeSearch";
import { motion } from "framer-motion";
import { getEvents } from "@/lib/api";
import { cn } from "@/lib/utils";

// Hàm để lấy dữ liệu trang chủ từ API
async function getHomePageData() {
  try {
    // Gọi API để lấy các sự kiện nổi bật và trending song song
    const [heroEventData, trendingEventsData] = await Promise.all([
      getEvents({ page: 0, size: 1, sort: "popularity,desc" }),
      getEvents({ page: 0, size: 3, sort: "trending,desc" }),
    ]);

    const heroEvent = heroEventData.content[0];
    const trendingEvents = trendingEventsData.content;

    // Nếu không có hero event, có thể lấy tạm event trending đầu tiên
    if (!heroEvent && trendingEvents.length > 0) {
      return { heroEvent: trendingEvents[0], trendingEvents };
    }

    return { heroEvent, trendingEvents };
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    return { heroEvent: null, trendingEvents: [] };
  }
}

// Dữ liệu tĩnh cho các section
const categoriesToHighlight = [
  {
    id: "cat-music",
    name: "Âm Nhạc Sôi Động",
    imageUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600",
    icon: <Users className="h-8 w-8" />,
  },
  {
    id: "cat-tech",
    name: "Công Nghệ Đột Phá",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600",
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: "cat-art",
    name: "Nghệ Thuật & Văn Hóa",
    imageUrl:
      "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=600",
    icon: <MapPin className="h-8 w-8" />,
  },
  {
    id: "cat-workshop",
    name: "Workshop Kỹ Năng",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600",
    icon: <CalendarDays className="h-8 w-8" />,
  },
];

const howItWorksSteps = [
  {
    icon: <Search className="h-8 w-8" />,
    title: "1. Tìm Kiếm",
    desc: "Duyệt qua hàng ngàn sự kiện hoặc tìm kiếm theo sở thích của bạn.",
    color: "from-indigo-500 to-pink-500",
  },
  {
    icon: <Ticket className="h-8 w-8" />,
    title: "2. Đặt Vé",
    desc: "Chọn vé, thanh toán an toàn và nhận vé điện tử ngay lập tức.",
    color: "from-pink-500 to-yellow-500",
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "3. Trải Nghiệm",
    desc: "Sử dụng QR code trên vé để check-in và tận hưởng sự kiện.",
    color: "from-yellow-500 to-green-400",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default async function HomePage() {
  const { heroEvent, trendingEvents } = await getHomePageData();

  if (!heroEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center p-4">
        <div>
          <h2 className="text-2xl font-bold">Lỗi tải trang</h2>
          <p className="text-muted-foreground mt-2">
            Không thể tải dữ liệu sự kiện. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white md:min-h-screen"
      >
        <Image
          src={heroEvent.coverImageUrl || "/placeholder.png"}
          alt={heroEvent.title}
          fill
          className="absolute inset-0 z-0 object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900/90 via-slate-900/70 to-transparent"></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-sm font-semibold tracking-wider"
          >
            SỰ KIỆN NỔI BẬT
          </Badge>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg"
          >
            {heroEvent.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-200 md:text-xl"
          >
            {heroEvent.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="group bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-xl"
              asChild
            >
              <Link href={`/events/${heroEvent.slug || heroEvent.id}`}>
                Mua vé ngay{" "}
                <Ticket className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-slate-900 shadow-sm backdrop-blur-sm"
              asChild
            >
              <Link href="/events">
                Khám phá thêm <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Search Bar Section */}
      <SectionWrapper className="-mt-12 relative z-20">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="rounded-xl bg-background/80 p-6 shadow-xl md:p-8 border border-slate-200/10 backdrop-blur-md"
        >
          <h2 className="mb-4 text-center text-xl font-semibold text-foreground md:text-2xl">
            Tìm kiếm sự kiện hoàn hảo cho bạn
          </h2>
          <HomeSearch />
        </motion.div>
      </SectionWrapper>

      {/* Trending Events Section */}
      <SectionWrapper
        title="Đang Thịnh Hành 🔥"
        subtitle="Những sự kiện không thể bỏ lỡ"
      >
        {trendingEvents.length > 0 ? (
          <motion.div
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8"
          >
            {trendingEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                variants={sectionVariants}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
              >
                <EventCard
                  event={event}
                  className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground mt-8">
            Chưa có sự kiện nào đang thịnh hành.
          </p>
        )}
        <div className="mt-12 text-center">
          <Link
            href="/events?sort=popularity"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-primary hover:text-primary/80"
            )}
          >
            Xem tất cả sự kiện hot <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </SectionWrapper>

      {/* Categories Highlight Section */}
      <SectionWrapper
        title="Khám Phá Theo Chủ Đề 🚀"
        subtitle="Tìm niềm đam mê của bạn"
        className="bg-gradient-to-br from-muted/30 to-transparent"
      >
        <motion.div
          className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {categoriesToHighlight.map((category, idx) => (
            <motion.div
              key={category.id}
              variants={sectionVariants}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
            >
              <CategoryHighlightCard category={category} />
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* How It Works Section */}
      <SectionWrapper
        title="Hoạt Động Như Thế Nào?"
        subtitle="Dễ dàng tìm và tham gia sự kiện"
      >
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
        >
          {howItWorksSteps.map((step, idx) => (
            <motion.div
              key={step.title}
              variants={sectionVariants}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="flex flex-col items-center text-center group"
            >
              <div
                className={cn(
                  "mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r text-white shadow-xl",
                  step.color
                )}
              >
                {step.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold group-hover:text-indigo-500 transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* Call to Action - Organize Event */}
      <SectionWrapper className="bg-slate-800 text-primary-foreground">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">
            Bạn là Nhà Tổ Chức Sự Kiện?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Tham gia nền tảng của chúng tôi để tiếp cận hàng ngàn người tham dự
            tiềm năng, quản lý vé hiệu quả và quảng bá sự kiện của bạn một cách
            dễ dàng.
          </p>
          <Button size="lg" variant="secondary" className="mt-8 group" asChild>
            <Link href="/admin/events/new">
              {" "}
              {/* Dẫn đến trang tạo sự kiện của admin */}
              Tổ chức sự kiện ngay{" "}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </SectionWrapper>
    </>
  );
}

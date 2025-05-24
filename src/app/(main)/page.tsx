//app/(main)/page.tsx
"use client";

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
import { Event } from "@/types";
import { cn } from "@/lib/utils";
import SectionWrapper from "@/components/shared/SectionWrapper";
import CategoryHighlightCard from "@/components/shared/CategoryHighlightCard";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

// ---- DỮ LIỆU MẪU ----
const heroEvent: Event = {
  id: "hero-event-1",
  title: "Lễ Hội Âm Nhạc Mùa Hè VIBEZ",
  description:
    "Đắm chìm trong không gian âm nhạc đa sắc màu với dàn DJ quốc tế và các nghệ sĩ hàng đầu Việt Nam. Một trải nghiệm không thể bỏ lỡ!",
  startDate: "2024-07-20T18:00:00",
  endDate: "2024-07-21T23:00:00",
  location: "Công viên Yên Sở, Hà Nội",
  address: "Công viên Yên Sở, Q. Hoàng Mai, Hà Nội",
  coverImageUrl:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  imageUrls: [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1920",
  ],
  maxParticipants: 10000,
  registrationStartDate: "2024-06-01T00:00:00",
  registrationEndDate: "2024-07-19T23:59:59",
  isPublic: true,
  latitude: 20.967102,
  longitude: 105.872196,
  categoryIds: ["cat2"],
  categories: [
    {
      id: "cat2",
      name: "Âm nhạc",
      createdAt: "",
    },
  ],
  organizer: {
    id: "org1",
    username: "VIBEZ_Ent",
    fullName: "VIBEZ Entertainment",
    avatarUrl: "https://ui-avatars.com/api/?name=VIBEZ+Entertainment",
  },
  status: {
    id: 2,
    status: "PUBLISHED",
    entityType: "EVENT",
  },
  currentParticipants: 5800,
  createdAt: "",
};

const trendingEvents: Event[] = [
  {
    id: "evt1",
    title: "Workshop Thiết Kế Đồ Họa Sáng Tạo",
    description: "Khám phá các kỹ thuật thiết kế mới cùng chuyên gia hàng đầu.",
    startDate: "2024-08-05T09:00:00",
    endDate: "2024-08-05T17:00:00",
    location: "Toong Coworking, Q1, HCM",
    address: "Toong, 126 Nguyễn Thị Minh Khai, Q1, TP.HCM",
    coverImageUrl:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=1920",
    imageUrls: [
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=1920",
    ],
    maxParticipants: 100,
    registrationStartDate: "2024-07-01T00:00:00",
    registrationEndDate: "2024-08-04T23:59:59",
    isPublic: true,
    latitude: 10.7756587,
    longitude: 106.7004238,
    categoryIds: ["cat-design"],
    categories: [{ id: "cat-design", name: "Thiết kế", createdAt: "" }],
    organizer: {
      id: "org2",
      username: "DesignPro",
      fullName: "Design Pro Team",
      avatarUrl: "https://ui-avatars.com/api/?name=Design+Pro",
    },
    status: {
      id: 2,
      status: "PUBLISHED",
      entityType: "EVENT",
    },
    currentParticipants: 80,
    createdAt: "",
  },
  {
    id: "evt2",
    title: "Giải Chạy Bộ Cộng Đồng RunForFun",
    description: "Tham gia giải chạy bộ vì sức khỏe và cộng đồng.",
    startDate: "2024-09-12T06:00:00",
    endDate: "2024-09-12T12:00:00",
    location: "Hồ Gươm, Hà Nội",
    address: "Bờ hồ Hoàn Kiếm, Q. Hoàn Kiếm, Hà Nội",
    coverImageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1920",
    imageUrls: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1920",
    ],
    maxParticipants: 3000,
    registrationStartDate: "2024-08-01T00:00:00",
    registrationEndDate: "2024-09-10T23:59:59",
    isPublic: true,
    latitude: 21.028511,
    longitude: 105.854222,
    categoryIds: ["cat-sport"],
    categories: [
      {
        id: "cat-sport",
        name: "Thể thao",
        createdAt: "",
      },
    ],
    organizer: {
      id: "org3",
      username: "RunForFun",
      fullName: "Cộng đồng Run For Fun",
      avatarUrl: "https://ui-avatars.com/api/?name=RunForFun",
    },
    status: {
      id: 2,
      status: "PUBLISHED",
      entityType: "EVENT",
    },
    currentParticipants: 1200,
    createdAt: "",
  },
  {
    id: "evt3",
    title: "Food Fest Đường Phố Sài Gòn",
    description: "Thưởng thức ẩm thực đường phố đặc sắc Sài Gòn.",
    startDate: "2024-08-20T16:00:00",
    endDate: "2024-08-20T22:00:00",
    location: "Phố đi bộ Nguyễn Huệ, HCM",
    address: "Nguyễn Huệ, Q1, TP.HCM",
    coverImageUrl:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920",
    imageUrls: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920",
    ],
    maxParticipants: 5000,
    registrationStartDate: "2024-07-15T00:00:00",
    registrationEndDate: "2024-08-19T23:59:59",
    isPublic: true,
    latitude: 10.773373,
    longitude: 106.704855,
    categoryIds: ["cat-food"],
    categories: [
      {
        id: "cat-food",
        name: "Ẩm thực",
        createdAt: "",
      },
    ],
    organizer: {
      id: "org4",
      username: "SaigonFoodies",
      fullName: "Saigon Foodies",
      avatarUrl: "https://ui-avatars.com/api/?name=Saigon+Foodies",
    },
    status: {
      id: 2,
      status: "PUBLISHED",
      entityType: "EVENT",
    },
    currentParticipants: 3400,
    createdAt: "",
  },
];

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
// ---- KẾT THÚC DỮ LIỆU MẪU ----

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white md:min-h-screen"
      >
        <Image
          src={heroEvent.coverImageUrl || ""}
          alt={heroEvent.title}
          fill
          className="absolute inset-0 z-0 object-cover opacity-50 scale-105 transition-transform duration-700 group-hover:scale-110"
          priority
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900/90 via-slate-900/70 to-transparent"></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-sm font-semibold tracking-wider animate-fade-in-up [animation-delay:0.2s]"
          >
            SỰ KIỆN NỔI BẬT NHẤT NĂM
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
              className="group bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-xl transition-all group-hover:scale-105"
              asChild
            >
              <Link href={`/events/${heroEvent.id}`}>
                Mua vé ngay{" "}
                <Ticket className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-slate-900 shadow-sm backdrop-blur-sm transition-colors"
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="text"
              placeholder="Nhập tên sự kiện, địa điểm, nghệ sĩ..."
              className="h-12 flex-grow text-base"
            />
            <Button
              size="lg"
              className="h-12 text-base sm:w-auto transition-all hover:scale-105"
            >
              <Search className="mr-2 h-5 w-5" /> Tìm kiếm
            </Button>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* Trending Events Section */}
      <SectionWrapper
        title="Đang Thịnh Hành 🔥"
        subtitle="Những sự kiện không thể bỏ lỡ"
      >
        <motion.div
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
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
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              }}
            >
              <EventCard
                event={event}
                className="transition-all duration-300"
              />
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-12 text-center">
          <Link
            href="/events?sort=popularity"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-primary hover:text-primary/80 transition-colors"
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
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {categoriesToHighlight.map((category, idx) => (
            <motion.div
              key={category.id}
              variants={sectionVariants}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              whileHover={{
                y: -8,
                scale: 1.04,
                boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              }}
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
          variants={{
            visible: { transition: { staggerChildren: 0.09 } },
          }}
        >
          {[
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
          ].map((step, idx) => (
            <motion.div
              key={step.title}
              variants={sectionVariants}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="flex flex-col items-center text-center group transition-all"
              whileHover={{ scale: 1.06, y: -6 }}
            >
              <div
                className={cn(
                  "mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r text-white shadow-xl group-hover:scale-110 transition-transform",
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
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 group transition-all hover:scale-105"
            asChild
          >
            <Link href="/create-event">
              Tạo sự kiện ngay{" "}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </SectionWrapper>
    </>
  );
}

// components/shared/NotificationBell.tsx
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Bell, Loader2, Calendar, CheckCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Notification } from "@/types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext"; // Sửa lại đường dẫn nếu cần
import { cn } from "@/lib/utils";
import Image from "next/image";

// ===================================
// BẮT ĐẦU PHẦN MOCK DATA VÀ API
// ===================================

// 1. Tạo dữ liệu giả
const mockNotificationsData: Notification[] = [
  {
    id: "1",
    content:
      'Sự kiện "ĐẠI NHẠC HỘI MÙA HÈ 2024" của bạn đã được phê duyệt và hiển thị công khai.',
    relatedEvent: {
      id: "event-1",
      title: "ĐẠI NHẠC HỘI MÙA HÈ 2024",
      slug: "dai-nhac-hoi-mua-he-2024",
      coverImageUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop",
    },
    type: "EVENT_APPROVED",
    read: false, // 1 thông báo chưa đọc
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 phút trước
  },
  {
    id: "2",
    content:
      'Chỉ còn 1 ngày nữa là đến sự kiện "Workshop Nhiếp ảnh Đường phố". Đừng bỏ lỡ nhé!',
    relatedEvent: {
      id: "event-2",
      title: "Workshop Nhiếp ảnh Đường phố",
      slug: "workshop-nhiep-anh",
      coverImageUrl:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2070&auto=format&fit=crop",
    },
    type: "EVENT_REMINDER",
    read: false, // 2 thông báo chưa đọc
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 giờ trước
  },
  {
    id: "3",
    content:
      'Bạn vừa mua thành công 2 vé cho sự kiện "Vở kịch kinh điển "Số Đỏ"". Kiểm tra vé của bạn ngay!',
    relatedEvent: {
      id: "event-3",
      title: 'Vở kịch kinh điển "Số Đỏ"',
      slug: "vo-kich-so-do",
      coverImageUrl:
        "https://images.unsplash.com/photo-1630050525402-06c617847d27?q=80&w=1974&auto=format&fit=crop",
    },
    type: "TICKET_PURCHASED",
    read: true, // Đã đọc
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 ngày trước
  },
  {
    id: "4",
    content:
      "Chào mừng bạn đến với TicketApp! Khám phá hàng ngàn sự kiện hấp dẫn ngay hôm nay.",
    type: "WELCOME",
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    relatedEvent: null,
  },
];

// 2. Tạo các hàm API giả lập
const mockApiDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getUnreadNotificationCount = async (): Promise<number> => {
  console.log("[MOCK API] Fetching unread count...");
  await mockApiDelay(300); // Giả lập độ trễ mạng
  const count = mockNotificationsData.filter((n) => !n.read).length;
  console.log("[MOCK API] Unread count is:", count);
  return count;
};

const getUserNotifications = async (params: {
  page: number;
  size: number;
}): Promise<{ content: Notification[] }> => {
  console.log("[MOCK API] Fetching notifications with params:", params);
  await mockApiDelay(800); // Giả lập độ trễ mạng lâu hơn
  const sortedNotifications = [...mockNotificationsData].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const paginatedContent = sortedNotifications.slice(
    params.page * params.size,
    (params.page + 1) * params.size
  );
  console.log("[MOCK API] Returned notifications:", paginatedContent);
  return { content: paginatedContent };
};

const markNotificationsAsRead = async (ids: string[]): Promise<void> => {
  console.log("[MOCK API] Marking notifications as read:", ids);
  await mockApiDelay(400);
  // Cập nhật trạng thái trong mảng mock data
  ids.forEach((id) => {
    const notification = mockNotificationsData.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  });
  console.log("[MOCK API] Mark as read complete.");
  // Trong thực tế, không cần trả về gì. Nếu có lỗi, hàm sẽ throw error.
  return Promise.resolve();
};

// ===================================
// KẾT THÚC PHẦN MOCK
// ===================================

// ===================================
// NotificationItem Component (Không đổi)
// ===================================
function NotificationItem({ notification }: { notification: Notification }) {
  const url = notification.relatedEvent?.slug
    ? `/event/${notification.relatedEvent.slug}`
    : "#";

  const icon = useMemo(() => {
    switch (notification.type) {
      case "EVENT_APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "EVENT_REMINDER":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  }, [notification.type]);

  const content = (
    <div className="flex items-start gap-4">
      {notification.relatedEvent?.coverImageUrl ? (
        <Image
          src={notification.relatedEvent.coverImageUrl}
          alt={notification.relatedEvent.title ?? "Event image"}
          width={48}
          height={48}
          className="rounded-md object-cover flex-shrink-0 mt-1"
        />
      ) : (
        <div className="flex-shrink-0 mt-1">{icon}</div>
      )}
      <div className="flex-1">
        <p className="text-sm text-foreground leading-snug">
          {notification.content}
        </p>
        <time className="text-xs text-muted-foreground mt-1 block">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: vi,
          })}
        </time>
      </div>
      {!notification.read && (
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center flex-shrink-0" />
      )}
    </div>
  );

  const className = "block p-3 transition-colors w-full text-left";
  // Sử dụng Link nếu có href, ngược lại dùng div
  const Wrapper = url !== "#" ? Link : "div";

  return (
    <li>
      <Wrapper href={url} className={cn(className, "hover:bg-muted/50")}>
        {content}
      </Wrapper>
    </li>
  );
}

// ===================================
// NotificationBell Component (Chính - Không đổi logic)
// ===================================
export default function NotificationBell() {
  // Logic bên trong component không cần thay đổi gì cả,
  // vì nó chỉ gọi đến các hàm API đã được giả lập ở trên.
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const popoverOpenedOnce = useRef(false);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const page = await getUserNotifications({ page: 0, size: 10 });
      setNotifications(page.content);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Không thể tải thông báo.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCount();
      const intervalId = setInterval(fetchCount, 30000);
      return () => clearInterval(intervalId);
    } else {
      setUnreadCount(0);
      setNotifications([]);
      setIsLoading(true);
    }
  }, [isAuthenticated, fetchCount]);

  const handleMarkAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    if (unreadIds.length === 0) return;

    setUnreadCount((prev) => Math.max(0, prev - unreadIds.length));
    setNotifications((prev) =>
      prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
    );

    try {
      await markNotificationsAsRead(unreadIds);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      toast.error("Không thể đánh dấu đã đọc.");
      fetchCount();
      fetchNotifications();
    }
  }, [notifications, fetchCount, fetchNotifications]);

  const onPopoverOpenChange = (open: boolean) => {
    if (open) {
      if (!popoverOpenedOnce.current) {
        fetchNotifications();
        popoverOpenedOnce.current = true;
      }
      setTimeout(() => {
        handleMarkAsRead();
      }, 1500);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover onOpenChange={onPopoverOpenChange}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0">
        <header className="p-3 font-semibold border-b text-sm flex justify-between items-center">
          <span>Thông báo</span>
        </header>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Bạn không có thông báo nào mới.
            </p>
          ) : (
            <ul className="divide-y dark:divide-gray-700">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// components/shared/NotificationBell.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Loader2, Calendar, MessageSquare } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { getNotificationsSummary, markNotificationsRead } from "@/lib/api";
import { Notification } from "@/types"; // Sử dụng type Notification đã được cập nhật
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Component con để render một item thông báo.
 * Nó nhận vào một đối tượng Notification và tự xử lý việc tạo link và hiển thị.
 */
function NotificationItem({ notification }: { notification: Notification }) {
  // Lấy slug trực tiếp từ dữ liệu được lồng vào. Rất đơn giản và hiệu quả.
  const url = notification.relatedEvent?.slug
    ? `/events/${notification.relatedEvent.slug}`
    : "#";
  const isClickable = url !== "#";

  const getIcon = (type?: string) => {
    switch (type) {
      case "EVENT_REMINDER":
        return <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />;
      case "NEW_COMMENT":
        return (
          <MessageSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
        );
      default:
        return <Bell className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
  };

  const content = (
    <div className="flex items-start gap-3">
      <div className="mt-1">{getIcon(notification.type)}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-800 dark:text-white leading-snug">
          {notification.content}
        </p>
        <time className="text-xs text-muted-foreground mt-1 block">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: vi,
          })}
        </time>
      </div>
    </div>
  );

  const className = "block p-3 rounded-lg transition-colors";

  if (isClickable) {
    return (
      <li>
        <Link
          href={url}
          className={cn(
            className,
            "hover:bg-muted/50 dark:hover:bg-gray-700/50"
          )}
        >
          {content}
        </Link>
      </li>
    );
  }

  return <li className={cn(className, "cursor-default")}>{content}</li>;
}

/**
 * Component chính cho chuông thông báo.
 * Tự động fetch, hiển thị số lượng, và cập nhật thông báo sau một khoảng thời gian.
 */
export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const hasMarkedAsRead = useRef(false);

  // Hàm fetch dữ liệu, được tối ưu để chỉ gọi 1 API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || isPopoverOpen) {
      if (!isAuthenticated) setIsLoading(false);
      return;
    }
    try {
      const summary = await getNotificationsSummary();
      setUnreadCount(summary.unreadCount);
      setNotifications(summary.notifications.content);
    } catch (error) {
      console.error("Failed to poll notifications:", error);
    } finally {
      if (isLoading) setIsLoading(false);
    }
  }, [isAuthenticated, isLoading, isPopoverOpen]);

  // Fetch lần đầu và thiết lập polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 30000); // Poll mỗi 30 giây
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Xử lý khi mở/đóng popover để đánh dấu đã đọc
  const handlePopoverOpen = async (open: boolean) => {
    setIsPopoverOpen(open);
    if (open && unreadCount > 0 && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true;
      const visibleNotificationIds = notifications.map((n) => n.id);
      if (visibleNotificationIds.length > 0) {
        try {
          await markNotificationsRead(visibleNotificationIds);
          setUnreadCount(0);
        } catch (err) {
          if (err instanceof Error) {
            console.error("Error marking notifications as read:", err.message);
          }
          toast.error("Không thể đánh dấu đã đọc.");
          hasMarkedAsRead.current = false; // Thử lại lần sau nếu thất bại
        }
      }
    }
    if (!open) {
      hasMarkedAsRead.current = false; // Reset khi đóng
    }
  };

  // Không hiển thị gì nếu chưa đăng nhập
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover onOpenChange={handlePopoverOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0">
        <div className="p-3 font-semibold border-b text-sm">Thông báo</div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Bạn không có thông báo nào.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
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

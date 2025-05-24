// components/shared/NotificationBell.tsx
"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  getUnreadCount,
  getUnreadNotifications,
  markNotificationsRead,
} from "@/lib/api";
import { Notification } from "@/types";
import { toast } from "sonner";

export default function NotificationBell() {
  const [count, setCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState<boolean>(true);
  const [list, setList] = useState<Notification[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  useEffect(() => {
    setLoadingCount(true);
    getUnreadCount()
      .then((c: number) => setCount(c))
      .catch(() => toast("Không tải được số thông báo."))
      .finally(() => setLoadingCount(false));
  }, [setLoadingCount]);

  const handleOpen = async () => {
    setLoadingList(true);
    try {
      const data = await getUnreadNotifications();
      const items = data.content;
      setList(items);
      if (items.length > 0) {
        await markNotificationsRead(items.map((n) => n.id));
        setCount(0);
      }
    } catch (err: unknown) {
      let msg = "Không hiển thị được thông báo.";
      if (err instanceof Error) msg = err.message;
      toast(msg);
    } finally {
      setLoadingList(false);
    }
  };

  return (
    <Popover onOpenChange={(open) => open && handleOpen()}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted/50 dark:hover:bg-muted/50">
          {loadingCount ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-300" />
          ) : (
            <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
          {count > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-2 bg-white dark:bg-gray-800"
      >
        {loadingList ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-600 dark:text-gray-300" />
          </div>
        ) : list.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground dark:text-muted-foreground">
            Không có thông báo mới.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {list.map((n) => (
              <li key={n.id}>
                <a
                  href={n.url}
                  className="block p-3 hover:bg-muted/50 dark:hover:bg-muted/50 rounded"
                >
                  <p className="font-medium text-gray-800 dark:text-white">
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    {n.message}
                  </p>
                  <time className="text-[10px] text-muted-foreground dark:text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </time>
                </a>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

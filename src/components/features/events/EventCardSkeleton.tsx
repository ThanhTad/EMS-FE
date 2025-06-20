// components/features/EventCardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm space-y-4 animate-pulse">
      <Skeleton className="h-40 w-full rounded-xl dark:bg-gray-700" />
      <Skeleton className="h-6 w-3/4 dark:bg-gray-700" />
      <Skeleton className="h-4 w-1/2 dark:bg-gray-700" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full dark:bg-gray-700" />
        <Skeleton className="h-8 w-20 rounded-full dark:bg-gray-700" />
      </div>
    </div>
  );
}

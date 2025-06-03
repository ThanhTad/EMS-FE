// app/(main)/settings/SettingsSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BellRing, Palette, ShieldCheck, ShieldQuestion } from "lucide-react";

const SkeletonCard = ({
  icon: Icon,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <Card className="bg-white dark:bg-slate-800/50 shadow-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
    <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-5 sm:p-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      ))}
    </CardContent>
  </Card>
);

export default function SettingsSkeleton() {
  return (
    <div className="container max-w-3xl mx-auto py-8 sm:py-12 px-4 space-y-8 sm:space-y-10">
      <header className="text-center">
        <Skeleton className="h-9 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </header>

      <SkeletonCard icon={BellRing} title="Thông báo" />
      <SkeletonCard icon={Palette} title="Giao diện & Đồng bộ hóa" />
      <SkeletonCard icon={ShieldCheck} title="Bảo mật" />

      <div className="flex items-center gap-4 pt-4">
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="my-8 sm:my-10 border-t border-slate-200 dark:border-slate-700" />

      <Card className="bg-white dark:bg-slate-800/50 shadow-lg rounded-xl overflow-hidden border border-red-500/50 dark:border-red-500/30">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldQuestion className="h-6 w-6 text-red-400" />
            <div>
              <Skeleton className="h-5 w-32 mb-1 bg-red-300/50 dark:bg-red-700/50" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-300 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40 bg-red-300/50 dark:bg-red-700/50" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-10 w-32 rounded-md bg-red-400/50 dark:bg-red-600/50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

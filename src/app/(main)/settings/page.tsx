// app/(main)/settings/page.tsx
import { getAndVerifyServerSideUser } from "@/lib/session";
import { getUserSettings, getCurrentUserAPI } from "@/lib/api";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import SettingsClient from "./SettingsClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Cài đặt | EMS",
};

function SettingsSkeleton() {
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 space-y-10 animate-pulse">
      <Skeleton className="h-8 w-48 mx-auto" />
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full border-red-500/50 border" />
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  // 1. BẢO VỆ ROUTE Ở SERVER
  const currentUser = await getAndVerifyServerSideUser();
  if (!currentUser) {
    redirect("/login?callbackUrl=/settings");
  }

  // 2. FETCH DỮ LIỆU BAN ĐẦU Ở SERVER
  try {
    const [settingsData, userData] = await Promise.all([
      getUserSettings(),
      getCurrentUserAPI(), // API này cần đảm bảo trả về User object
    ]);

    if (!userData) {
      throw new Error("Không thể lấy thông tin người dùng.");
    }

    // Nếu fetch thành công, render Client Component và truyền data vào
    return (
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsClient initialSettings={settingsData} initialUser={userData} />
      </Suspense>
    );
  } catch (error) {
    // 3. XỬ LÝ LỖI FETCH Ở SERVER
    const message =
      error instanceof Error ? error.message : "Không thể tải cài đặt của bạn.";

    return (
      <div className="container mx-auto flex justify-center py-12">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    );
  }
}

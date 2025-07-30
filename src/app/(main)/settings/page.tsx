// app/(main)/settings/page.tsx
import { redirect } from "next/navigation";
import { Suspense } from "react";
import SettingsClient from "./SettingsClient";
import SettingsSkeleton from "@/components/features/SettingsSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";
import { fetchFromServer } from "@/lib/server-api"; // Import helper mới
import type { User, UserSettings } from "@/types";

// Component chính giờ đây đảm nhiệm việc fetch dữ liệu
async function SettingsData() {
  try {
    // ==========================================================
    // TỐI ƯU #1: SỬ DỤNG Promise.all ĐỂ GỌI API SONG SONG
    // ==========================================================
    const [userData, settingsData] = await Promise.all([
      fetchFromServer<User>("/api/v1/auth/me"),
      fetchFromServer<UserSettings>("/api/v1/users/me/settings"),
    ]);

    // Nếu không có user, redirect (logic không đổi)
    if (!userData) {
      const callbackUrl = encodeURIComponent("/settings");
      redirect(`/login?callbackUrl=${callbackUrl}`);
    }

    // Trả về component client với dữ liệu đã fetch
    return (
      <SettingsClient initialUser={userData} initialSettings={settingsData} />
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thể tải dữ liệu cài đặt của bạn.";

    console.error("❌ SettingsPage fetch error:", message);

    // Component hiển thị lỗi (không đổi)
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsData />
    </Suspense>
  );
}

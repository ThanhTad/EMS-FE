// app/(main)/settings/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserSettings,
  updateUserSettings,
  adminDeleteUser,
  getCurrentUserInfo,
  sendOtpToEnable2FAAPI,
} from "@/lib/api";
import {
  UserSettings,
  UpdateUserSettingsRequest,
  User,
  ThemeOption,
  OtpType,
} from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  Bell,
  ShieldAlert,
  Monitor,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";
import { useTwoFactor } from "@/hooks/useTwoFactor";

const themeOptions: ThemeOption[] = ["light", "dark", "system"];

export default function SettingPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { user: authUser, logout, isLoading: authLoading } = useAuth();
  const { sendOtpToDisable2FA } = useTwoFactor();

  // State cho user_settings
  const [settings, setSettings] = useState<UserSettings>({
    receiveEventReminders: true,
    receiveNewEventNotifications: false,
    receivePromotionalEmails: false,
    theme: "system",
    syncWithGoogleCalendar: false,
  });
  const [initial, setInitial] = useState<UserSettings>({} as UserSettings);

  // State cho user (lấy 2FA)
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Lấy settings và user info song song
  const fetchAll = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const [settingsData, userData] = await Promise.all([
        getUserSettings(),
        getCurrentUserInfo(),
      ]);
      setSettings({
        receiveEventReminders: settingsData.receiveEventReminders ?? true,
        receiveNewEventNotifications:
          settingsData.receiveNewEventNotifications ?? false,
        receivePromotionalEmails:
          settingsData.receivePromotionalEmails ?? false,
        theme: settingsData.theme ?? "system",
        syncWithGoogleCalendar: settingsData.syncWithGoogleCalendar ?? false,
      });
      setInitial({
        receiveEventReminders: settingsData.receiveEventReminders ?? true,
        receiveNewEventNotifications:
          settingsData.receiveNewEventNotifications ?? false,
        receivePromotionalEmails:
          settingsData.receivePromotionalEmails ?? false,
        theme: settingsData.theme ?? "system",
        syncWithGoogleCalendar: settingsData.syncWithGoogleCalendar ?? false,
      });
      setUser(userData.user ?? null);
    } catch (err: unknown) {
      let msg = "Lỗi";
      if (err instanceof Error) msg = err.message;
      toast("Lỗi " + msg);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading) fetchAll();
  }, [authLoading, fetchAll]);

  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  const onChange = <K extends keyof UserSettings>(k: K, v: UserSettings[K]) =>
    setSettings((s) => ({ ...s, [k]: v }));

  const onSave = async () => {
    if (!authUser) return;
    const payload: UpdateUserSettingsRequest = {};
    if (settings.receiveEventReminders !== initial.receiveEventReminders) {
      payload.receiveEventReminders = settings.receiveEventReminders!;
    }
    if (
      settings.receiveNewEventNotifications !==
      initial.receiveNewEventNotifications
    ) {
      payload.receiveNewEventNotifications =
        settings.receiveNewEventNotifications!;
    }
    if (
      settings.receivePromotionalEmails !== initial.receivePromotionalEmails
    ) {
      payload.receivePromotionalEmails = settings.receivePromotionalEmails!;
    }
    if (settings.theme !== initial.theme) {
      payload.theme = settings.theme!;
    }
    if (settings.syncWithGoogleCalendar !== initial.syncWithGoogleCalendar) {
      payload.syncWithGoogleCalendar = settings.syncWithGoogleCalendar!;
    }
    if (Object.keys(payload).length === 0) {
      toast("Không có thay đổi");
      return;
    }
    setSaving(true);
    try {
      await updateUserSettings(payload);
      setInitial({ ...settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast("Đã lưu");
    } catch (e: unknown) {
      let msg = "Lỗi";
      if (e instanceof Error) msg = e.message;
      toast(msg);
    } finally {
      setSaving(false);
    }
  };

  // Xử lý bật/tắt 2FA: chuyển sang trang /2fa để xác thực
  const onToggle2fa = async (enabled: boolean) => {
    if (!user) return;
    // Nếu đã bật và muốn tắt => gửi OTP để xác nhận tắt
    // Nếu đang tắt và muốn bật => bắt đầu flow enable 2FA
    try {
      // Gọi API gửi OTP cho disable hoặc enable
      if (enabled) {
        // Bật 2FA: Gọi API để bắt đầu bật (gửi QR hoặc OTP), sau đó chuyển sang trang xác thực        // Nếu BE cần gọi enable trước, thì gọi enable API ở đây
        await sendOtpToEnable2FAAPI({
          username: user.username,
          otpType: OtpType.ENABLE_2FA_VERIFICATION,
        });
        console.log("Gửi OTP để bật 2FA" + user.username);
        router.push("/otp?mode=enable-2fa");
      } else {
        // Tắt 2FA: gửi OTP rồi chuyển sang xác thực
        await sendOtpToDisable2FA({
          username: user.username,
          otpType: OtpType.DISABLE_2FA_VERIFICATION,
        });
        router.push("/otp?mode=disable-2fa");
      }
    } catch (err: unknown) {
      let msg = "Lỗi";
      if (err instanceof Error) msg = err.message;
      toast(msg);
    }
  };

  const onDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await adminDeleteUser(user.id);
      toast("Tài khoản đã xóa");
      logout();
    } catch (err: unknown) {
      let msg = "Lỗi";
      if (err instanceof Error) msg = err.message;
      toast(msg);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-900 dark:text-gray-100">
        Đang tải cài đặt…
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-2xl mx-auto py-10 px-4 md:px-8 space-y-10 text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold dark:text-white text-center mb-8">
          Cài đặt
        </h1>

        {/* Notifications */}
        <Card className="bg-white dark:bg-gray-800 shadow rounded-xl">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
              <Bell className="text-gray-600 dark:text-gray-300" /> Thông báo
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Email nhắc nhở và thông báo mới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {(
              [
                "receiveEventReminders",
                "receiveNewEventNotifications",
                "receivePromotionalEmails",
              ] as const
            ).map((k) => (
              <div
                key={k}
                className="flex justify-between items-center border border-gray-100 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <Label
                  htmlFor={k}
                  className="text-gray-800 dark:text-gray-100 font-medium"
                >
                  {
                    {
                      receiveEventReminders: "Nhắc sự kiện",
                      receiveNewEventNotifications: "Sự kiện mới",
                      receivePromotionalEmails: "Khuyến mãi",
                    }[k]
                  }
                </Label>
                <Switch
                  id={k}
                  checked={!!settings[k]}
                  onCheckedChange={(v) => onChange(k, v)}
                  disabled={saving}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Theme + Sync */}
        <Card className="bg-white dark:bg-gray-800 shadow rounded-xl">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
              <Monitor className="text-gray-600 dark:text-gray-300" /> Giao diện
              & Đồng bộ
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Chọn theme & đồng bộ Google Calendar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-center border border-gray-100 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <Label
                htmlFor="theme"
                className="text-gray-800 dark:text-gray-100 font-medium"
              >
                Theme
              </Label>
              <Select
                value={settings.theme}
                onValueChange={(v) => {
                  onChange("theme", v as ThemeOption);
                  setTheme(v as string);
                }}
                disabled={saving}
              >
                <SelectTrigger className="w-[180px]" />{" "}
                {/* hoặc để trống nếu có style riêng */}
                <SelectContent>
                  {themeOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "light"
                        ? "Sáng"
                        : opt === "dark"
                        ? "Tối"
                        : "Hệ thống"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center border border-gray-100 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <Label
                htmlFor="sync"
                className="text-gray-800 dark:text-gray-100 font-medium"
              >
                Đồng bộ Google Calendar
              </Label>
              <Switch
                id="sync"
                checked={!!settings.syncWithGoogleCalendar}
                onCheckedChange={(v) => onChange("syncWithGoogleCalendar", v)}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-white dark:bg-gray-800 shadow rounded-xl">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
              <ShieldCheck className="text-gray-600 dark:text-gray-300" /> Bảo
              mật
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Các cài đặt bảo mật nâng cao
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-center border border-gray-100 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div>
                <Label
                  htmlFor="twoFactorEnabled"
                  className="text-gray-800 dark:text-gray-100 font-medium"
                >
                  Xác thực 2 lớp (2FA)
                </Label>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                  Khi bật, bạn cần xác thực thêm một bước mỗi lần đăng nhập để
                  bảo vệ tài khoản tốt hơn.
                </div>
              </div>
              <Switch
                id="twoFactorEnabled"
                checked={!!user?.twoFactorEnabled}
                onCheckedChange={onToggle2fa}
                // Không disabled khi updating, vì sẽ chuyển trang luôn
              />
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onSave}
            disabled={saving}
            className="flex items-center px-8 py-2 rounded-lg font-semibold text-base bg-primary dark:bg-primary text-white dark:text-white shadow"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Lưu thay đổi
          </Button>
          {saved && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              Đã lưu!
            </span>
          )}
        </div>

        <Separator className="border-gray-200 dark:border-gray-700" />

        {/* Delete account */}
        <Card className="bg-white dark:bg-gray-800 shadow rounded-xl">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <CardTitle className="flex items-center gap-2 text-destructive dark:text-destructive-foreground text-lg">
              <ShieldAlert className="text-destructive-foreground dark:text-destructive" />
              Tài khoản
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Xóa vĩnh viễn tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex items-center px-6 py-2 rounded-lg font-semibold text-base"
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Xóa tài khoản
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white dark:bg-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900 dark:text-white">
                    Xác nhận xóa
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                    Hành động không thể hoàn tác. Dữ liệu sẽ mất vĩnh viễn.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="dark:text-gray-100"
                    disabled={deleting}
                  >
                    Hủy
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive dark:bg-destructive text-destructive-foreground dark:text-destructive-foreground"
                    onClick={onDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : null}
                    Xóa vĩnh viễn
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

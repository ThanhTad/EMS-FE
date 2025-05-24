// app/(main)/settings/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserSettings,
  updateUserSettings,
  adminDeleteUser,
} from "@/lib/api";
import { UserSettings, UpdateUserSettingsRequest, ThemeOption } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Bell, ShieldAlert, Monitor, Trash2 } from "lucide-react";
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

const themeOptions: ThemeOption[] = ["light", "dark", "system"];

export default function SettingPage() {
  const { setTheme } = useTheme();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [settings, setSettings] = useState<UserSettings>({
    receiveEventReminders: true,
    receiveNewEventNotifications: false,
    receivePromotionalEmails: false,
    theme: "system",
    syncWithGoogleCalendar: false,
  });
  const [initial, setInitial] = useState<UserSettings>({} as UserSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserSettings();
      const merged: UserSettings = {
        receiveEventReminders: data.receiveEventReminders ?? true,
        receiveNewEventNotifications:
          data.receiveNewEventNotifications ?? false,
        receivePromotionalEmails: data.receivePromotionalEmails ?? false,
        theme: data.theme ?? "system",
        syncWithGoogleCalendar: data.syncWithGoogleCalendar ?? false,
      };
      setSettings(merged);
      setInitial(merged);
    } catch (err: unknown) {
      let msg = "Lỗi";
      if (err instanceof Error) msg = err.message;
      toast("Lỗi " + msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetch();
  }, [authLoading, fetch]);

  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  const onChange = <K extends keyof UserSettings>(k: K, v: UserSettings[K]) =>
    setSettings((s) => ({ ...s, [k]: v }));

  const onSave = async () => {
    if (!user) return;
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
      <div className="container mx-auto p-8 space-y-8 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold dark:text-white">Cài đặt</h1>

        {/* Notifications */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Bell className="text-gray-600 dark:text-gray-300" /> Thông báo
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Email nhắc nhở và thông báo mới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                "receiveEventReminders",
                "receiveNewEventNotifications",
                "receivePromotionalEmails",
              ] as const
            ).map((k) => (
              <div
                key={k}
                className="flex justify-between items-center border border-gray-200 dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-700"
              >
                <Label htmlFor={k} className="text-gray-800 dark:text-gray-100">
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
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Monitor className="text-gray-600 dark:text-gray-300" /> Giao diện
              & Đồng bộ
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Chọn theme & đồng bộ Google Calendar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border border-gray-200 dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-700">
              <Label
                htmlFor="theme"
                className="text-gray-800 dark:text-gray-100"
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
                {themeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === "light"
                      ? "Sáng"
                      : opt === "dark"
                      ? "Tối"
                      : "Hệ thống"}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex justify-between items-center border border-gray-200 dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-700">
              <Label
                htmlFor="sync"
                className="text-gray-800 dark:text-gray-100"
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

        {/* Save button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onSave}
            disabled={saving}
            className="flex items-center"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Lưu thay đổi
          </Button>
          {saved && (
            <span className="text-green-600 dark:text-green-400">Đã lưu!</span>
          )}
        </div>

        <Separator className="border-gray-200 dark:border-gray-700" />

        {/* Delete account */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-destructive dark:text-destructive-foreground">
              <ShieldAlert className="text-destructive-foreground dark:text-destructive" />{" "}
              Tài khoản
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Xóa vĩnh viễn tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
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

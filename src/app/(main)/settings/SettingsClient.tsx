"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserSettings, adminDeleteUser } from "@/lib/api";
import { UserSettings, User, ThemeOption, OtpType } from "@/types";
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
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Bell, ShieldAlert, Monitor, ShieldCheck } from "lucide-react";
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
import { useOtp } from "@/hooks/useOtp"; // Sử dụng hook đã refactor

const themeOptions: { value: ThemeOption; label: string }[] = [
  { value: "light", label: "Sáng" },
  { value: "dark", label: "Tối" },
  { value: "system", label: "Hệ thống" },
];

// Component nhận dữ liệu ban đầu làm props
interface SettingsClientProps {
  initialSettings: UserSettings;
  initialUser: User;
}

export default function SettingsClient({
  initialSettings,
  initialUser,
}: SettingsClientProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { logout } = useAuth();
  const { sendOtpToEnable2FA } = useOtp(); // Giả sử hook useOtp có hàm này

  // Chỉ cần state cho những gì người dùng thay đổi
  const [settings, setSettings] = useState(initialSettings);
  const [user] = useState(initialUser);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Đồng bộ theme của next-themes khi settings thay đổi
  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  const handleSettingsChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    // So sánh object hiện tại với object ban đầu để xem có gì thay đổi không
    if (JSON.stringify(settings) === JSON.stringify(initialSettings)) {
      toast.info("Không có thay đổi nào để lưu.");
      return;
    }

    setIsSaving(true);
    try {
      await updateUserSettings(settings);
      toast.success("Cài đặt đã được lưu thành công!");
      // Cập nhật lại trạng thái ban đầu để so sánh cho lần sau
      // initialSettings = { ...settings }; // Lỗi: không thể gán lại prop
      // Để đơn giản, ta có thể refresh trang hoặc để người dùng tự thấy
      router.refresh(); // Cách tốt nhất để cập nhật lại initialData
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      toast.error("Lưu thất bại", { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const onToggle2fa = async (enabled: boolean) => {
    if (!user) return;
    try {
      const otpType = enabled
        ? OtpType.ENABLE_2FA_VERIFICATION
        : OtpType.DISABLE_2FA_VERIFICATION;
      const mode = enabled ? "enable-2fa" : "disable-2fa";

      // Giả sử API gửi OTP của bạn có thể xử lý cả hai trường hợp
      await sendOtpToEnable2FA({ username: user.username, otpType });

      toast.info("Đang chuyển đến trang xác thực OTP...");
      router.push(`/otp?mode=${mode}&identifier=${user.username}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể bắt đầu quá trình 2FA.";
      toast.error("Đã có lỗi", { description: message });
    }
  };

  const onDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await adminDeleteUser(user.id);
      toast.success("Tài khoản của bạn đã được xóa vĩnh viễn.");
      await logout(); // Gọi hàm logout từ AuthContext
      router.push("/"); // Chuyển về trang chủ
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể xóa tài khoản.";
      toast.error("Xóa thất bại", { description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 space-y-10">
      <h1 className="text-3xl font-bold text-center">Cài đặt</h1>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell /> Thông báo
          </CardTitle>
          <CardDescription>Quản lý các thông báo qua email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminders">Nhắc nhở sự kiện sắp tới</Label>
            <Switch
              id="reminders"
              checked={settings.receiveEventReminders}
              onCheckedChange={(v) =>
                handleSettingsChange("receiveEventReminders", v)
              }
              disabled={isSaving}
            />
          </div>
          {/* ... các switch khác ... */}
        </CardContent>
      </Card>

      {/* Theme & Sync Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor /> Giao diện & Đồng bộ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Chủ đề</Label>
            <Select
              value={settings.theme}
              onValueChange={(v) =>
                handleSettingsChange("theme", v as ThemeOption)
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* ... switch cho Google Calendar ... */}
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck /> Bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="2fa">Xác thực hai yếu tố (2FA)</Label>
              <p className="text-sm text-muted-foreground">
                Tăng cường bảo mật cho tài khoản của bạn.
              </p>
            </div>
            <Switch
              id="2fa"
              checked={user.twoFactorEnabled}
              onCheckedChange={onToggle2fa}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu thay đổi
        </Button>
      </div>

      <Separator />

      {/* Delete Account Card */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <ShieldAlert /> Khu vực nguy hiểm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Xóa tài khoản</p>
              <p className="text-sm text-muted-foreground">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Xóa tài khoản
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu
                    liên quan. Bạn sẽ không thể khôi phục lại.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Hủy
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? "Đang xóa..." : "Tôi hiểu, xóa tài khoản"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

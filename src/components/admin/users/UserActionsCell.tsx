// components/admin/events/UserActionsCell.tsx
"use client";

import React, { useState, useCallback } from "react";
import { AdminResetPasswordRequest, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  KeyRound,
  Loader2,
  Copy as CopyIcon,
} from "lucide-react";
import { toast } from "sonner";
import { adminDeleteUser, adminResetUserPassword } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface UserActionsCellProps {
  user: User;
}

// Schema cho form reset password
const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmNewPassword"],
  });
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const UserActionsCell: React.FC<UserActionsCellProps> = ({ user }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [justResetPassword, setJustResetPassword] = useState<string | null>(
    null
  );

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Xoá user
  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await adminDeleteUser(user.id);
      toast.success(`Người dùng ${user.username} đã được xóa.`);
      router.refresh();
    } catch (err) {
      let message = "Xóa thất bại. Vui lòng thử lại.";
      if (err instanceof Error) message = err.message;
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }, [user.id, user.username, router]);

  // Sửa thông tin & phân quyền
  const handleEditUser = useCallback(() => {
    router.push(`/admin/users/${user.id}/edit`);
  }, [router, user.id]);

  // Mở dialog đặt lại mật khẩu
  const handleOpenResetPasswordDialog = () => {
    resetPasswordForm.reset();
    setJustResetPassword(null);
    setIsResetPasswordDialogOpen(true);
  };

  // Đóng dialog đặt lại mật khẩu và reset form
  const handleResetPasswordDialogOpenChange = (open: boolean) => {
    setIsResetPasswordDialogOpen(open);
    if (!open) {
      resetPasswordForm.reset();
      setJustResetPassword(null);
    }
  };

  // Copy mật khẩu vừa đặt lại
  const handleCopyPassword = async () => {
    if (!justResetPassword) return;
    try {
      await navigator.clipboard.writeText(justResetPassword);
      toast.success("Đã copy mật khẩu vào clipboard!");
    } catch {
      toast.error("Không thể copy mật khẩu. Vui lòng copy thủ công.");
    }
  };

  // Đặt lại mật khẩu
  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setIsResettingPassword(true);
    try {
      const payload: AdminResetPasswordRequest = {
        newPassword: values.newPassword,
      };
      await adminResetUserPassword(user.id, payload);
      setJustResetPassword(values.newPassword); // Lưu mật khẩu mới để hiển thị/copy
      toast.success("Thành công", {
        description: `Mật khẩu cho ${user.username} đã được đặt lại.`,
      });
      // Không đóng dialog ngay, cho admin copy mật khẩu
    } catch (error) {
      let message = "Không thể đặt lại mật khẩu.";
      if (error instanceof Error) message = error.message;
      toast.error("Đặt lại thất bại", { description: message });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" type="button">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem
            asChild
            disabled={isDeleting}
            onClick={handleEditUser}
          >
            <button type="button" className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Sửa thông tin & Phân quyền
            </button>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            disabled={isDeleting}
            onClick={handleOpenResetPasswordDialog}
          >
            <button type="button" className="flex items-center">
              <KeyRound className="mr-2 h-4 w-4" />
              Đặt lại mật khẩu
            </button>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild disabled={isDeleting}>
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa người dùng
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Người dùng <strong>{user.username}</strong> sẽ bị xóa vĩnh viễn.
              Bạn có chắc không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isDeleting}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              aria-busy={isDeleting}
              type="button"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for Reset Password */}
      <AlertDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={handleResetPasswordDialogOpenChange}
      >
        <AlertDialogContent>
          {!justResetPassword ? (
            <form
              onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Đặt lại mật khẩu cho {user.username}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Nhập mật khẩu mới cho người dùng này. Người dùng sẽ cần sử
                  dụng mật khẩu này để đăng nhập.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    required
                    {...resetPasswordForm.register("newPassword")}
                    disabled={isResettingPassword}
                    aria-invalid={
                      !!resetPasswordForm.formState.errors.newPassword
                    }
                    aria-describedby={
                      resetPasswordForm.formState.errors.newPassword
                        ? "reset-password-error"
                        : undefined
                    }
                  />
                  {resetPasswordForm.formState.errors.newPassword && (
                    <p
                      className="text-xs text-red-600"
                      id="reset-password-error"
                      role="alert"
                      aria-live="polite"
                    >
                      {resetPasswordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">
                    Xác nhận mật khẩu mới
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    required
                    {...resetPasswordForm.register("confirmNewPassword")}
                    disabled={isResettingPassword}
                    aria-invalid={
                      !!resetPasswordForm.formState.errors.confirmNewPassword
                    }
                    aria-describedby={
                      resetPasswordForm.formState.errors.confirmNewPassword
                        ? "confirm-reset-password-error"
                        : undefined
                    }
                  />
                  {resetPasswordForm.formState.errors.confirmNewPassword && (
                    <p
                      className="text-xs text-red-600"
                      id="confirm-reset-password-error"
                      role="alert"
                      aria-live="polite"
                    >
                      {
                        resetPasswordForm.formState.errors.confirmNewPassword
                          .message
                      }
                    </p>
                  )}
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel
                  type="button"
                  disabled={isResettingPassword}
                  onClick={() => setIsResetPasswordDialogOpen(false)}
                >
                  Hủy
                </AlertDialogCancel>
                <Button
                  type="submit"
                  disabled={isResettingPassword}
                  aria-busy={isResettingPassword}
                >
                  {isResettingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Đặt lại
                </Button>
              </AlertDialogFooter>
            </form>
          ) : (
            <div>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Đặt lại mật khẩu thành công cho <b>{user.username}</b>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="my-4 text-center">
                    <span className="block mb-2 font-medium">
                      Mật khẩu mới:
                    </span>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-mono px-3 py-2 rounded bg-muted text-lg select-all border border-gray-200">
                        {justResetPassword}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCopyPassword}
                        type="button"
                        aria-label="Copy password"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    Vui lòng gửi mật khẩu này cho người dùng. Mật khẩu chỉ hiển
                    thị một lần!
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  type="button"
                  onClick={() => setIsResetPasswordDialogOpen(false)}
                >
                  Đóng
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserActionsCell;

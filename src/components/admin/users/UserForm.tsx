// components/admin/users/UserForm.tsx

"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  UserRole,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, UserPlus, ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";

// Zod schema cho form
const baseUserSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
    .max(50, "Tên đăng nhập không quá 50 ký tự."),
  email: z.string().email("Email không hợp lệ.").max(100),
  fullName: z.string().max(100).optional().or(z.literal("")),
  phoneNumber: z.string().max(20).optional().or(z.literal("")),
  role: z.nativeEnum(UserRole).optional(), // Có thể undefined khi tạo mới (BE sẽ tự mặc định là USER)
});

const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
    .max(100)
    .optional()
    .or(z.literal("")),
});

const updateUserSchema = baseUserSchema;

// Value types
type CreateValues = z.infer<typeof createUserSchema>;

type UserFormPayload = AdminCreateUserRequest | AdminUpdateUserRequest;

// Generic Props cho Create/Update
interface UserFormProps<T extends UserFormPayload> {
  initialData?: User | null;
  onSubmit: (data: T) => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
}

const UserForm = <T extends UserFormPayload>({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
}: UserFormProps<T>) => {
  const formSchema = isEditMode ? updateUserSchema : createUserSchema;

  const form = useForm<CreateValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: initialData?.username || "",
      email: initialData?.email || "",
      password: "",
      fullName: initialData?.fullName || "",
      phoneNumber: initialData?.phone || "",
      role: initialData?.role || UserRole.USER,
    },
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        username: initialData.username,
        email: initialData.email,
        password: "",
        fullName: initialData.fullName || "",
        phoneNumber: initialData.phone || "",
        role: initialData.role || UserRole.USER,
      });
    }
  }, [initialData, isEditMode, form]);

  const handleFormSubmit = async (values: CreateValues) => {
    let payload: UserFormPayload;
    if (isEditMode) {
      payload = {
        email: values.email,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        role: values.role ?? UserRole.USER,
      } as AdminUpdateUserRequest;
    } else {
      payload = {
        username: values.username,
        email: values.email,
        password: values.password || undefined,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        role: values.role ?? UserRole.USER,
      } as AdminCreateUserRequest;
    }
    try {
      await onSubmit(payload as T);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại!");
      } else {
        toast.error("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
      }
    }
  };

  const availableRoles = Object.values(UserRole);

  return (
    <Card className="w-full max-w-2xl mx-auto" aria-labelledby="form-title">
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        aria-describedby="form-desc"
      >
        <CardHeader>
          <CardTitle
            id="form-title"
            className="text-2xl flex items-center gap-2"
          >
            {isEditMode ? (
              <UserCog className="h-6 w-6" aria-hidden="true" />
            ) : (
              <UserPlus className="h-6 w-6" aria-hidden="true" />
            )}
            {isEditMode
              ? `Sửa thông tin: ${initialData?.username || ""}`
              : "Thêm người dùng mới"}
          </CardTitle>
          <CardDescription id="form-desc">
            {isEditMode
              ? "Cập nhật thông tin chi tiết cho người dùng này."
              : "Điền thông tin để tạo tài khoản người dùng mới."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              placeholder="Nhập tên đăng nhập"
              required
              {...form.register("username")}
              disabled={isLoading || isEditMode}
              aria-invalid={!!form.formState.errors.username}
              aria-describedby={
                form.formState.errors.username ? "username-error" : undefined
              }
              tabIndex={0}
            />
            {form.formState.errors.username && (
              <p
                className="text-xs text-red-600"
                id="username-error"
                role="alert"
                aria-live="polite"
              >
                {form.formState.errors.username.message}
              </p>
            )}
            {isEditMode && (
              <p className="text-xs text-muted-foreground">
                Tên đăng nhập không thể thay đổi.
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập địa chỉ email"
              required
              {...form.register("email")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.email}
              aria-describedby={
                form.formState.errors.email ? "email-error" : undefined
              }
              tabIndex={0}
            />
            {form.formState.errors.email && (
              <p
                className="text-xs text-red-600"
                id="email-error"
                role="alert"
                aria-live="polite"
              >
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password (chỉ hiển thị khi tạo mới) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Để trống nếu muốn hệ thống tự tạo"
                {...form.register("password")}
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.password}
                aria-describedby={
                  form.formState.errors.password ? "password-error" : undefined
                }
                tabIndex={0}
              />
              {form.formState.errors.password && (
                <p
                  className="text-xs text-red-600"
                  id="password-error"
                  role="alert"
                  aria-live="polite"
                >
                  {form.formState.errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Nếu để trống, mật khẩu sẽ được tạo ngẫu nhiên (cần backend hỗ
                trợ gửi email hoặc hiển thị).
              </p>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              placeholder="Nhập họ và tên"
              {...form.register("fullName")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.fullName}
              aria-describedby={
                form.formState.errors.fullName ? "fullname-error" : undefined
              }
              tabIndex={0}
            />
            {form.formState.errors.fullName && (
              <p
                className="text-xs text-red-600"
                id="fullname-error"
                role="alert"
                aria-live="polite"
              >
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Số điện thoại</Label>
            <Input
              id="phoneNumber"
              placeholder="Nhập số điện thoại"
              {...form.register("phoneNumber")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.phoneNumber}
              aria-describedby={
                form.formState.errors.phoneNumber ? "phone-error" : undefined
              }
              tabIndex={0}
            />
            {form.formState.errors.phoneNumber && (
              <p
                className="text-xs text-red-600"
                id="phone-error"
                role="alert"
                aria-live="polite"
              >
                {form.formState.errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Role: chỉ chọn 1, dùng radio group */}
          <fieldset
            className="space-y-2"
            aria-labelledby="role-label"
            disabled={isLoading}
          >
            <legend className="block text-sm font-medium mb-1" id="role-label">
              Vai trò
            </legend>
            <div
              className="flex space-x-6"
              role="radiogroup"
              aria-labelledby="role-label"
            >
              {availableRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`role-${role}`}
                    value={role}
                    {...form.register("role")}
                    checked={form.watch("role") === role}
                    onChange={() =>
                      form.setValue("role", role, { shouldValidate: true })
                    }
                    disabled={isLoading}
                    aria-checked={form.watch("role") === role}
                    aria-labelledby={`role-label-${role}`}
                    tabIndex={0}
                  />
                  <Label
                    htmlFor={`role-${role}`}
                    id={`role-label-${role}`}
                    className="font-normal cursor-pointer"
                  >
                    {role}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.role && (
              <p
                className="text-xs text-red-600"
                id="role-error"
                role="alert"
                aria-live="polite"
              >
                {form.formState.errors.role.message}
              </p>
            )}
            {!isEditMode && (
              <p className="text-xs text-muted-foreground">
                Nếu không chọn, vai trò sẽ mặc định là <strong>USER</strong>.
              </p>
            )}
          </fieldset>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            asChild
            type="button"
            tabIndex={0}
            aria-disabled={isLoading}
            disabled={isLoading}
          >
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Quay lại
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            aria-disabled={isLoading}
            tabIndex={0}
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                {isEditMode ? "Lưu thay đổi" : "Tạo người dùng"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserForm;

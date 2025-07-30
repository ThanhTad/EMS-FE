import { getAndVerifyServerSideUser } from "@/lib/session";
import { UserRole } from "@/types";
import { redirect } from "next/navigation";
import CreateUserClient from "@/components/admin/users/CreateUserClient"; // Import Client Component
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo người dùng mới | Admin EMS",
};

export default async function AdminCreateUserPage() {
  // BẢO VỆ ROUTE Ở PHÍA SERVER
  const currentUser = await getAndVerifyServerSideUser();

  // Chỉ ADMIN mới được tạo người dùng
  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    if (!currentUser) {
      redirect("/login?callbackUrl=/admin/users/new");
    }
    redirect("/unauthorized");
  }

  // Nếu có quyền, render Client Component để hiển thị form
  return <CreateUserClient />;
}

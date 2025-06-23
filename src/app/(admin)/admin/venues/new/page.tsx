// app/admin/venues/new/page.tsx

import { getAndVerifyServerSideUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import NewVenueClient from "@/components/admin/venues/NewVenueClient"; // Component Client sẽ tạo ở bước 2
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo Địa điểm mới | Admin EMS",
};

// Đây là một Server Component, không có "use client"
export default async function NewVenuePage() {
  // 1. Bảo vệ route trên server
  const user = await getAndVerifyServerSideUser();
  if (!user || ![UserRole.ADMIN, UserRole.ORGANIZER].includes(user.role)) {
    redirect("/unauthorized");
  }

  // 2. Render component client, không cần truyền props
  return <NewVenueClient />;
}

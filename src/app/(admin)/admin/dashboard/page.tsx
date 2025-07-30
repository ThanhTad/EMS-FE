// app/(admin)/dashboard/page.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, Ticket, DollarSign } from "lucide-react";
import { Metadata } from "next";

// Import các component biểu đồ mới
import { RecentRevenueChart } from "@/components/admin/charts/RecentRevenueChart";
import { UserActivityChart } from "@/components/admin/charts/UserActivityChart";

export const metadata: Metadata = {
  title: "Bảng điều khiển Admin | EMS",
  description: "Tổng quan hệ thống quản lý sự kiện.",
};

// --- DỮ LIỆU MẪU ---
// Trong thực tế, bạn sẽ fetch dữ liệu này
async function getDashboardData() {
  return {
    stats: {
      totalUsers: 1250,
      activeEvents: 35,
      ticketsSoldToday: 150,
      totalRevenue: 75800000,
    },
    revenueData: [
      { name: "Tháng 1", revenue: 4000000 },
      { name: "Tháng 2", revenue: 3000000 },
      { name: "Tháng 3", revenue: 5000000 },
      { name: "Tháng 4", revenue: 4500000 },
      { name: "Tháng 5", revenue: 6000000 },
      { name: "Tháng 6", revenue: 5500000 },
      { name: "Tháng 7", revenue: 7200000 },
    ],
    userActivityData: [
      { day: "T2", newUsers: 20, activeUsers: 150 },
      { day: "T3", newUsers: 35, activeUsers: 180 },
      { day: "T4", newUsers: 25, activeUsers: 220 },
      { day: "T5", newUsers: 40, activeUsers: 250 },
      { day: "T6", newUsers: 60, activeUsers: 300 },
      { day: "T7", newUsers: 55, activeUsers: 280 },
      { day: "CN", newUsers: 70, activeUsers: 320 },
    ],
  };
}

export default async function AdminDashboardPage() {
  const { stats, revenueData, userActivityData } = await getDashboardData();

  const statsItems = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />,
    },
    {
      title: "Sự kiện đang hoạt động",
      value: stats.activeEvents.toString(),
      icon: (
        <CalendarDays className="h-6 w-6 text-gray-500 dark:text-gray-400" />
      ),
    },
    {
      title: "Vé bán hôm nay",
      value: stats.ticketsSoldToday.toLocaleString(),
      icon: <Ticket className="h-6 w-6 text-gray-500 dark:text-gray-400" />,
    },
    {
      title: "Tổng doanh thu",
      value: `${stats.totalRevenue.toLocaleString()} đ`,
      icon: <DollarSign className="h-6 w-6 text-gray-500 dark:text-gray-400" />,
    },
  ];

  return (
    <main role="main" className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Bảng điều khiển
      </h1>

      {/* Phần thống kê nhanh */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Thống kê nhanh
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsItems.map((item) => (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Phần biểu đồ */}
      <section aria-labelledby="charts-heading">
        <h2
          id="charts-heading"
          className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4"
        >
          Biểu đồ phân tích
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* SỬ DỤNG COMPONENT BIỂU ĐỒ MỚI */}
          <RecentRevenueChart data={revenueData} />
          <UserActivityChart data={userActivityData} />
        </div>
      </section>
    </main>
  );
}

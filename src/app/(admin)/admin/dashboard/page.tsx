// app/(admin)/dashboard/page.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, CalendarDays, Ticket, DollarSign } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng điều khiển Admin | EMS",
  description: "Tổng quan hệ thống quản lý sự kiện.",
};

// Giả sử có API lấy thống kê, tạm thời hardcode
async function getDashboardStats() {
  return {
    totalUsers: 1250,
    activeEvents: 35,
    ticketsSoldToday: 150,
    totalRevenue: 75800000,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statsItems = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers.toLocaleString(),
      icon: (
        <Users
          className="h-6 w-6 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      ),
      description: "Số người dùng đã đăng ký",
    },
    {
      title: "Sự kiện đang hoạt động",
      value: stats.activeEvents.toString(),
      icon: (
        <CalendarDays
          className="h-6 w-6 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      ),
      description: "Sự kiện hiện đã được kích hoạt",
    },
    {
      title: "Vé bán hôm nay",
      value: stats.ticketsSoldToday.toLocaleString(),
      icon: (
        <Ticket
          className="h-6 w-6 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      ),
      description: "Tổng số vé bán ra trong ngày",
    },
    {
      title: "Tổng doanh thu",
      value: `${stats.totalRevenue.toLocaleString()} đ`,
      icon: (
        <DollarSign
          className="h-6 w-6 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      ),
      description: "Doanh thu tích lũy",
    },
  ];

  return (
    <main role="main" className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Bảng điều khiển
      </h1>
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Thống kê nhanh
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsItems.map((item) => (
            <Card
              key={item.title}
              className="focus-within:ring-2 focus-within:ring-offset-2"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.title}
                  </CardTitle>
                  {item.icon}
                </div>
                <CardDescription className="sr-only">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  tabIndex={0}
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100 focus:outline-none"
                  aria-label={`${item.title}: ${item.value}`}
                >
                  {item.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="charts-heading">
        <h2
          id="charts-heading"
          className="text-2xl font-semibold text-gray-800 dark:text-gray-200"
        >
          Biểu đồ
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu gần đây</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <span>Đang tải biểu đồ...</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hoạt động người dùng</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <span>Đang tải biểu đồ...</span>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

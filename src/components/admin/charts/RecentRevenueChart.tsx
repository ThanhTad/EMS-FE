//components/admin/charts/RecentRevenueChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Định nghĩa kiểu dữ liệu cho props
interface RevenueChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

export const RecentRevenueChart = ({ data }: RevenueChartProps) => {
  // Hàm format trục Y để hiển thị đơn vị tiền tệ
  const formatYAxis = (tickItem: number) => {
    return `${(tickItem / 1000000).toLocaleString()}tr`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu gần đây (VNĐ)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} VNĐ`,
                "Doanh thu",
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              name="Doanh thu"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

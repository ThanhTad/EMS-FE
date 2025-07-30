// components/admin/charts/UserActivityChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserActivityChartProps {
  data: {
    day: string;
    newUsers: number;
    activeUsers: number;
  }[];
}

export const UserActivityChart = ({ data }: UserActivityChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động người dùng (Tuần này)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
              cursor={{ fill: "hsl(var(--muted))" }}
            />
            <Legend />
            <Bar
              dataKey="newUsers"
              fill="hsl(var(--primary-softer))"
              name="Người dùng mới"
            />
            <Bar
              dataKey="activeUsers"
              fill="hsl(var(--primary))"
              name="Người dùng hoạt động"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

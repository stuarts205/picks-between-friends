"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTRPC } from "@/trpc/client";
import { mockUserWeeklyPoints } from "@/modules/analytics/type";
import { User } from "better-auth";

interface UserWeeklyBarChartProps {
  user: User | null;
}

const chartConfig = {
  points: {
    label: "Points",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const UserWeeklyBarChart = ({ user }: UserWeeklyBarChartProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.analytics.getWeeklyPointsForUser.queryOptions(),
  );
  //const data = mockUserWeeklyPoints;

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h3 className="text-lg font-medium">Weekly Points - {user?.name ?? "Guest"}</h3>
        <p className="text-sm text-muted-foreground">
          Your total points earned each week this season.
        </p>
      </div>
      {data.length ? (
        <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => `Wk ${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Week ${value}`}
                />
              }
            />
            <Bar dataKey="points" fill="var(--color-points)" radius={4} />
          </BarChart>
        </ChartContainer>
      ) : (
        <p className="text-sm text-muted-foreground">
          No picks yet this season.
        </p>
      )}
    </div>
  );
};

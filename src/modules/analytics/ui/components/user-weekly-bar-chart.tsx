"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";
import { User } from "better-auth";

interface UserWeeklyBarChartProps {
  user: User | null;
  currentWeek: number;
}

const chartConfig = {
  points: {
    label: "Points",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const ALL_WEEKS = "all";

export const UserWeeklyBarChart = ({
  user,
  currentWeek,
}: UserWeeklyBarChartProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.analytics.getWeeklyPointsForUser.queryOptions(),
  );
  //const data = mockUserWeeklyPoints;

  const [selectedWeek, setSelectedWeek] = useState(ALL_WEEKS);

  // Every week of the season so far, whether or not the user has picks in it,
  // so the dropdown is always there and an empty week shows up as zero.
  const pointsByWeek = new Map(data.map(({ week, points }) => [week, points]));
  const lastWeek = Math.max(currentWeek, ...data.map(({ week }) => week));
  const weeks = Array.from({ length: lastWeek }, (_, index) => index + 1);

  const chartData = weeks
    .filter((week) => selectedWeek === ALL_WEEKS || week === Number(selectedWeek))
    .map((week) => ({ week, points: pointsByWeek.get(week) ?? 0 }));

  const hasPoints = chartData.some(({ points }) => points > 0);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">
            Weekly Points - {user?.name ?? "Guest"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedWeek === ALL_WEEKS
              ? "Your total points earned each week this season."
              : `Your total points earned in Week ${selectedWeek}.`}
          </p>
        </div>
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_WEEKS}>All weeks</SelectItem>
            {weeks.map((week) => (
              <SelectItem key={week} value={String(week)}>
                Week {week}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasPoints ? (
        <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
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
          {selectedWeek === ALL_WEEKS
            ? "No points yet this season."
            : `No points for Week ${selectedWeek} yet.`}
        </p>
      )}
    </div>
  );
};

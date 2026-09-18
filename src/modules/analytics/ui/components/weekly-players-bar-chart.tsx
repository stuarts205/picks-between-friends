"use client";
import { useState } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
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

const chartConfig = {
  wins: {
    label: "Wins",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const ALL_WEEKS = "all";
const ROW_HEIGHT = 36;
const NAME_AXIS_WIDTH = 128;
// Longest name that fits on one line in the axis; the tooltip has the full name.
const MAX_NAME_LENGTH = 16;

const shortName = (name: string) =>
  name.length > MAX_NAME_LENGTH ? `${name.slice(0, MAX_NAME_LENGTH - 1)}…` : name;

export const WeeklyPlayersBarChart = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.analytics.getManyForOverall.queryOptions(),
  );
  const picks = data.items;

  const [selectedWeek, setSelectedWeek] = useState(ALL_WEEKS);

  const weeks = Array.from(new Set(picks.map((pick) => pick.week))).sort(
    (a, b) => a - b,
  );

  const players = Array.from(
    new Map(
      picks.map((pick) => [pick.userId, pick.userName ?? "Unknown user"]),
    ),
    ([id, name]) => ({ id, name }),
  );
  const nameById = new Map(players.map((player) => [player.id, player.name]));

  const winningPicks = picks.filter(
    (pick) =>
      pick.win === true &&
      (selectedWeek === ALL_WEEKS || pick.week === Number(selectedWeek)),
  );

  // Keyed by id rather than name so two players with the same display name
  // still get their own bar. The locale is pinned so the server render and
  // every viewer agree on the order of ties.
  const chartData = players
    .map((player) => ({
      ...player,
      wins: winningPicks.filter((pick) => pick.userId === player.id).length,
    }))
    .sort(
      (a, b) =>
        b.wins - a.wins ||
        a.name.localeCompare(b.name, "en") ||
        a.id.localeCompare(b.id, "en"),
    );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Wins by Player</h3>
          <p className="text-sm text-muted-foreground">
            {selectedWeek === ALL_WEEKS
              ? "Total wins for each player this season."
              : `Total wins for each player in Week ${selectedWeek}.`}
          </p>
        </div>
        {weeks.length ? (
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
        ) : null}
      </div>

      {!weeks.length ? (
        <p className="text-sm text-muted-foreground">
          No picks yet this season.
        </p>
      ) : !winningPicks.length ? (
        <p className="text-sm text-muted-foreground">
          {selectedWeek === ALL_WEEKS
            ? "No wins recorded yet this season."
            : `No wins recorded for Week ${selectedWeek} yet.`}
        </p>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          style={{ height: chartData.length * ROW_HEIGHT + 8 }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 28, bottom: 4, left: 0 }}
          >
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              dataKey="id"
              type="category"
              width={NAME_AXIS_WIDTH}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(id: string) => shortName(nameById.get(id) ?? "")}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_label, payload) =>
                    payload?.[0]?.payload?.name
                  }
                />
              }
            />
            <Bar
              dataKey="wins"
              fill="var(--color-wins)"
              radius={[0, 4, 4, 0]}
              barSize={18}
            >
              <LabelList
                dataKey="wins"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
};

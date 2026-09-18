"use client";
import { useState } from "react";
import { Pie, PieChart } from "recharts";
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
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

// Categorical palette in a fixed order, as CSS variables scoped to the section
// (light step, then the dark step) so the pie and the list share one source.
// Players are handed slots in order and never re-colored; anyone past the last
// slot is folded into a neutral "Other" rather than reusing a color.
const PLAYER_COLORS = [
  "[--win-1:#2a78d6] dark:[--win-1:#3987e5]",
  "[--win-2:#eb6834] dark:[--win-2:#d95926]",
  "[--win-3:#1baf7a] dark:[--win-3:#199e70]",
  "[--win-4:#eda100] dark:[--win-4:#c98500]",
  "[--win-5:#e87ba4] dark:[--win-5:#d55181]",
  "[--win-6:#008300]",
  "[--win-7:#4a3aa7] dark:[--win-7:#9085e9]",
  "[--win-8:#e34948] dark:[--win-8:#e66767]",
];
const PALETTE = [...PLAYER_COLORS, "[--win-other:#898781]"].join(" ");

// Slice colors come from the variables above, so the config carries none.
const chartConfig: ChartConfig = {};

type WinSlice = {
  key: string;
  name: string;
  wins: number;
  fill: string;
};

const winsLabel = (wins: number) => `${wins} ${wins === 1 ? "win" : "wins"}`;

export const WeeklyPlayerPercentage = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.analytics.getManyForOverall.queryOptions(),
  );
  const picks = data.items;

  const weeks = Array.from(new Set(picks.map((pick) => pick.week))).sort(
    (a, b) => a - b,
  );

  // Open on the latest week that has a win, so the chart isn't empty while the
  // current week's games are still being played.
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(() => {
    const winningWeeks = new Set(
      picks.filter((pick) => pick.win === true).map((pick) => pick.week),
    );
    return (
      weeks.filter((week) => winningWeeks.has(week)).at(-1) ?? weeks.at(-1)
    );
  });

  // Alphabetical, so a player keeps the same color and slice position in every
  // week and switching weeks never repaints anyone. The locale is pinned so the
  // server render and every viewer agree on the order.
  const players = Array.from(
    new Map(
      picks.map((pick) => [pick.userId, pick.userName ?? "Unknown user"]),
    ),
    ([id, name]) => ({ id, name }),
  ).sort(
    (a, b) => a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id, "en"),
  );

  const weekWins = picks.filter(
    (pick) => pick.week === selectedWeek && pick.win === true,
  );

  const slices: WinSlice[] = [];
  players.forEach((player, index) => {
    const wins = weekWins.filter((pick) => pick.userId === player.id).length;
    if (!wins) return;

    const hasColor = index < PLAYER_COLORS.length;
    const key = hasColor ? player.id : "other";
    const existing = slices.find((slice) => slice.key === key);
    if (existing) {
      existing.wins += wins;
      return;
    }
    slices.push({
      key,
      name: hasColor ? player.name : "Other",
      wins,
      fill: `var(--win-${hasColor ? index + 1 : "other"})`,
    });
  });

  const percent = (wins: number) =>
    ((wins / weekWins.length) * 100).toFixed(1);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Weekly Win Percentage</h3>
          <p className="text-sm text-muted-foreground">
            Share of the total wins each player earned in a given week.
          </p>
        </div>
        {weeks.length ? (
          <Select
            value={selectedWeek !== undefined ? String(selectedWeek) : undefined}
            onValueChange={(value) => setSelectedWeek(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
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
      ) : !slices.length ? (
        <p className="text-sm text-muted-foreground">
          No wins recorded for Week {selectedWeek} yet.
        </p>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center gap-6 md:flex-row",
            PALETTE,
          )}
        >
          <ChartContainer
            config={chartConfig}
            role="img"
            aria-label={`Pie chart of each player's share of the wins in week ${selectedWeek}`}
            className="aspect-square w-full max-w-[260px] shrink-0"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(_value, _name, item) => {
                      const slice = item.payload as WinSlice;
                      return (
                        <>
                          <span
                            className="size-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: slice.fill }}
                          />
                          <span className="text-muted-foreground">
                            {slice.name}
                          </span>
                          <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                            {winsLabel(slice.wins)} · {percent(slice.wins)}%
                          </span>
                        </>
                      );
                    }}
                  />
                }
              />
              <Pie
                data={slices}
                dataKey="wins"
                startAngle={90}
                endAngle={-270}
                stroke="var(--background)"
                strokeWidth={2}
              />
            </PieChart>
          </ChartContainer>

          {/* Same order as the slices (clockwise from the top); doubles as the
              table view, so no value depends on color or hover. */}
          <ul className="flex w-full flex-col divide-y md:flex-1">
            {slices.map((slice) => (
              <li
                key={slice.key}
                className="flex items-center gap-3 py-2 text-sm"
              >
                <span
                  className="size-3 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: slice.fill }}
                />
                <span className="flex-1 font-medium">{slice.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {winsLabel(slice.wins)}
                </span>
                <span className="w-14 text-right font-medium tabular-nums">
                  {percent(slice.wins)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

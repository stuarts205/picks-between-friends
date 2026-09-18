"use client";
import { useId, useState } from "react";
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
import {
  type PlayerColor,
  playerColors,
} from "@/modules/analytics/lib/player-colors";
import { useTRPC } from "@/trpc/client";

const paletteCss = (scope: string, colors: PlayerColor[]) => {
  const vars = (mode: keyof PlayerColor) =>
    colors.map((color, index) => `--win-${index}:${color[mode]};`).join("");
  return `[data-win-palette="${scope}"]{${vars("light")}}.dark [data-win-palette="${scope}"]{${vars("dark")}}`;
};

// Slice colors come from the palette variables, so the config carries none.
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
  const paletteId = useId();
  const { data } = useSuspenseQuery(
    trpc.analytics.getManyForOverall.queryOptions(),
  );
  const { data: roster } = useSuspenseQuery(
    trpc.analytics.getPlayers.queryOptions(),
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

  // Everyone who has made a pick, alphabetical, so a player keeps the same color
  // and slice position in every week and switching weeks never repaints anyone.
  // The locale is pinned so the server render and every viewer agree on the order.
  const players = [...roster].sort(
    (a, b) => a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id, "en"),
  );

  const weekWins = picks.filter(
    (pick) => pick.week === selectedWeek && pick.win === true,
  );

  // Every player owns a color slot, whether or not they won this week, so
  // colors never shift when the week changes.
  const slices: WinSlice[] = players
    .map((player, index) => ({
      key: player.id,
      name: player.name,
      wins: weekWins.filter((pick) => pick.userId === player.id).length,
      fill: `var(--win-${index})`,
    }))
    .filter((slice) => slice.wins > 0);

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
          data-win-palette={paletteId}
          className="flex flex-col items-center gap-6 md:flex-row"
        >
          <style
            dangerouslySetInnerHTML={{
              __html: paletteCss(paletteId, playerColors(players.length)),
            }}
          />
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
                // a lone slice is a full circle, and its stroke would draw a seam
                strokeWidth={slices.length > 1 ? 2 : 0}
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

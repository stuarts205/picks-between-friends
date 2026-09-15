'use client'
import { useState } from 'react'
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from '@/trpc/client';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, CircleIcon, MinusIcon, XIcon } from "lucide-react";

export const UserPickResults = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.analytics.getPicksByWeekByUser.queryOptions(),
  );

  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(
    () => data.at(-1)?.week,
  );

  const weekResults = data.find((w) => w.week === selectedWeek);
  const collegePicks =
    weekResults?.picks.filter((p) => p.league === "college-football") ?? [];
  const nflPicks = weekResults?.picks.filter((p) => p.league === "nfl") ?? [];

  const renderTeamLabel = (
    teamInfo: (typeof collegePicks)[number]["awayTeam"],
    isPicked: boolean,
  ) => (
    <span className="flex items-center gap-2">
      {teamInfo?.logo ? (
        <span className="relative inline-block w-5 h-5 shrink-0">
          <Image
            src={teamInfo.logo}
            alt={teamInfo.name ?? "Team logo"}
            fill
            className="object-contain"
          />
        </span>
      ) : null}
      <span
        className={isPicked ? "font-bold" : "font-normal text-muted-foreground"}
        style={isPicked && teamInfo?.color ? { color: teamInfo.color } : undefined}
      >
        {teamInfo?.abbreviation ?? teamInfo?.name ?? "?"}
      </span>
    </span>
  );

  const renderPickRow = (p: (typeof collegePicks)[number]) => (
    <div
      key={p.id}
      className="flex items-center justify-between rounded-md border p-3"
    >
      <div className="flex items-center gap-3 text-sm font-medium uppercase">
        {renderTeamLabel(p.awayTeam, p.teamId === p.awayTeam?.id)}
        <span className="text-muted-foreground">@</span>
        {renderTeamLabel(p.homeTeam, p.teamId === p.homeTeam?.id)}
      </div>
      {p.push === true ? (
        <div className="relative w-5 h-5">
          <CircleIcon className="w-full h-full fill-gray-400 text-gray-400" />
          <MinusIcon
            className="absolute inset-0 m-auto w-3 h-3 text-white"
            strokeWidth={3}
          />
        </div>
      ) : p.win === true ? (
        <div className="relative w-5 h-5">
          <CircleIcon className="w-full h-full fill-green-500 text-green-500" />
          <CheckIcon
            className="absolute inset-0 m-auto w-3 h-3 text-white"
            strokeWidth={3}
          />
        </div>
      ) : p.win === false ? (
        <div className="relative w-5 h-5">
          <CircleIcon className="w-full h-full fill-red-500 text-red-500" />
          <XIcon
            className="absolute inset-0 m-auto w-3 h-3 text-white"
            strokeWidth={3}
          />
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Pending</span>
      )}
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Pick Results</h3>
          <p className="text-sm text-muted-foreground">
            See how your picks did for a given week.
          </p>
        </div>
        {data.length ? (
          <Select
            value={selectedWeek !== undefined ? String(selectedWeek) : undefined}
            onValueChange={(value) => setSelectedWeek(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              {data.map(({ week }) => (
                <SelectItem key={week} value={String(week)}>
                  Week {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {!data.length ? (
        <p className="text-sm text-muted-foreground">
          No picks yet this season.
        </p>
      ) : (
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex w-full flex-col gap-2 md:w-1/2">
            <p className="text-sm text-muted-foreground">College</p>
            {collegePicks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No picks for this week.
              </p>
            ) : (
              collegePicks.map((p) => renderPickRow(p))
            )}
          </div>
          <div className="flex w-full flex-col gap-2 md:w-1/2">
            <p className="text-sm text-muted-foreground">NFL</p>
            {nflPicks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No picks for this week.
              </p>
            ) : (
              nflPicks.map((p) => renderPickRow(p))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

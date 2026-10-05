"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";

type TeamRecord = {
  id: string;
  name: string;
  logo: string | null;
  wins: number;
  losses: number;
};

const LIST_SIZE = 5;

const netWins = (record: TeamRecord) => record.wins - record.losses;
const winPercentage = (record: TeamRecord) =>
  (record.wins / (record.wins + record.losses)) * 100;

export const PickedTeamStats = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.analytics.getPicksByWeekByUser.queryOptions(),
  );

  // Tally a win/loss for each team the user has picked to win. Picks that
  // haven't been graded yet are skipped.
  const records = new Map<string, TeamRecord>();
  data
    .flatMap(({ picks }) => picks)
    .forEach((p) => {
      if (p.win === null) return;

      const pickedTeam = [p.homeTeam, p.awayTeam].find(
        (t) => t?.id === p.teamId,
      );
      if (!pickedTeam) return;

      const record = records.get(pickedTeam.id) ?? {
        id: pickedTeam.id,
        name: pickedTeam.name,
        logo: pickedTeam.logo,
        wins: 0,
        losses: 0,
      };

      if (p.win) {
        record.wins += 1;
      } else {
        record.losses += 1;
      }

      records.set(pickedTeam.id, record);
    });

  // Rank by net wins (wins - losses) so a team picked many times outranks a
  // team picked once, then break ties on win percentage.
  const ranked = Array.from(records.values()).sort(
    (a, b) =>
      netWins(b) - netWins(a) ||
      winPercentage(b) - winPercentage(a) ||
      a.name.localeCompare(b.name),
  );
  const best = ranked.filter((r) => netWins(r) > 0).slice(0, LIST_SIZE);
  const worst = ranked
    .filter((r) => netWins(r) < 0)
    .reverse()
    .slice(0, LIST_SIZE);

  const renderTeamRow = (record: TeamRecord) => (
    <div
      key={record.id}
      className="flex items-center justify-between rounded-md border p-3"
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        {record.logo ? (
          <span className="relative inline-block w-5 h-5 shrink-0">
            <Image
              src={record.logo}
              alt={record.name}
              fill
              className="object-contain"
            />
          </span>
        ) : null}
        {record.name}
      </span>
      <span className="text-sm text-muted-foreground">
        {record.wins}-{record.losses} ({winPercentage(record).toFixed(0)}%)
      </span>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h3 className="text-lg font-medium">Picked Team Performance</h3>
        <p className="text-sm text-muted-foreground">
          How the teams you picked to win have done for you.
        </p>
      </div>

      {!ranked.length ? (
        <p className="text-sm text-muted-foreground">No graded picks yet.</p>
      ) : (
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex w-full flex-col gap-2 md:w-1/2">
            <p className="text-sm text-muted-foreground">Best</p>
            {best.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No teams with a winning record yet.
              </p>
            ) : (
              best.map(renderTeamRow)
            )}
          </div>
          <div className="flex w-full flex-col gap-2 md:w-1/2">
            <p className="text-sm text-muted-foreground">Worst</p>
            {worst.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No teams with a losing record yet.
              </p>
            ) : (
              worst.map(renderTeamRow)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

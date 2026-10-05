"use client";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Team = {
  id: string;
  name: string;
  logo: string | null;
  league: string;
};

type TeamRecord = Team & {
  wins: number;
  losses: number;
};

const LIST_SIZE = 5;

const LEAGUES = [
  { key: "college-football", label: "College" },
  { key: "nfl", label: "NFL" },
];

const netWins = (record: TeamRecord) => record.wins - record.losses;
const decidedPicks = (record: TeamRecord) => record.wins + record.losses;
const winPercentage = (record: TeamRecord) =>
  decidedPicks(record) ? (record.wins / decidedPicks(record)) * 100 : 0;

const TeamRow = ({ record }: { record: TeamRecord }) => (
  <div className="flex items-center justify-between rounded-md border p-3">
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
      {decidedPicks(record)
        ? `${record.wins}-${record.losses} (${winPercentage(record).toFixed(0)}%)`
        : "No graded picks yet"}
    </span>
  </div>
);

// Dropdown of every team the admin selected; shows the chosen team's record
// from the user's picks (0-0 if the user hasn't picked or graded that team).
const TeamRecordLookup = ({
  teams,
  records,
}: {
  teams: Team[];
  records: Map<string, TeamRecord>;
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>();
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const selectedRecord = selectedTeam
    ? (records.get(selectedTeam.id) ?? { ...selectedTeam, wins: 0, losses: 0 })
    : null;

  return (
    <div className="flex flex-col gap-2">
      <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedRecord ? <TeamRow record={selectedRecord} /> : null}
    </div>
  );
};

// A "Best" or "Worst" block: the ranked rows plus the team lookup dropdown.
const TeamSection = ({
  title,
  emptyText,
  rows,
  teams,
  records,
}: {
  title: string;
  emptyText: string;
  rows: TeamRecord[];
  teams: Team[];
  records: Map<string, TeamRecord>;
}) => (
  <div className="flex flex-col gap-2">
    <p className="text-sm text-muted-foreground">{title}</p>
    {rows.length === 0 ? (
      <p className="text-sm text-muted-foreground">{emptyText}</p>
    ) : (
      rows.map((record) => <TeamRow key={record.id} record={record} />)
    )}
    {/* Pinned to the bottom so the dropdowns line up across leagues. */}
    <div className="mt-auto">
      <TeamRecordLookup teams={teams} records={records} />
    </div>
  </div>
);

// One league's block, split into Best and Worst. Renders three grid items
// (heading, Best, Worst) for the parent grid: the heading spans the full width
// and Best/Worst sit side by side on the next row (stacked on mobile).
const LeaguePanel = ({
  label,
  league,
  ranked,
  teams,
  records,
}: {
  label: string;
  league: string;
  ranked: TeamRecord[];
  teams: Team[];
  records: Map<string, TeamRecord>;
}) => {
  const leagueRanked = ranked.filter((r) => r.league === league);
  const leagueTeams = teams.filter((t) => t.league === league);
  const best = leagueRanked.filter((r) => netWins(r) > 0).slice(0, LIST_SIZE);
  const worst = leagueRanked
    .filter((r) => netWins(r) < 0)
    .reverse()
    .slice(0, LIST_SIZE);

  return (
    <>
      <h4 className="mt-4 font-medium first:mt-0 md:col-span-2">{label}</h4>
      <TeamSection
        title="Best"
        emptyText="No teams with a winning record yet."
        rows={best}
        teams={leagueTeams}
        records={records}
      />
      <TeamSection
        title="Worst"
        emptyText="No teams with a losing record yet."
        rows={worst}
        teams={leagueTeams}
        records={records}
      />
    </>
  );
};

export const PickedTeamStats = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.analytics.getPicksByWeekByUser.queryOptions(),
  );
  const { data: selectedTeams } = useSuspenseQuery(
    trpc.analytics.getSelectedTeams.queryOptions(),
  );

  // Tally a win/loss for each team the user has picked to win. Picks that
  // haven't been graded yet are skipped.
  const records = new Map<string, TeamRecord>();
  data
    .flatMap(({ picks }) => picks)
    .forEach((p) => {
      if (p.win === null || !p.league) return;

      const pickedTeam = [p.homeTeam, p.awayTeam].find(
        (t) => t?.id === p.teamId,
      );
      if (!pickedTeam) return;

      const record = records.get(pickedTeam.id) ?? {
        id: pickedTeam.id,
        name: pickedTeam.name,
        logo: pickedTeam.logo,
        league: p.league,
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
        // One shared grid: each league gets a heading row, then a Best | Worst
        // row that sizes to the taller side so the two stay aligned.
        <div className="grid gap-4 md:grid-cols-2">
          {LEAGUES.map(({ key, label }) => (
            <LeaguePanel
              key={key}
              label={label}
              league={key}
              ranked={ranked}
              teams={selectedTeams}
              records={records}
            />
          ))}
        </div>
      )}
    </div>
  );
};

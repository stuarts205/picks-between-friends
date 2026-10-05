"use client";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import type { TeamRecordsGetMany } from "@/modules/analytics/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TeamRecord = TeamRecordsGetMany[number];

const LIST_SIZE = 5;

const LEAGUES = [
  { key: "college-football", label: "College" },
  { key: "nfl", label: "NFL" },
];

const netWins = (record: TeamRecord) => record.wins - record.losses;
const decidedGames = (record: TeamRecord) => record.wins + record.losses;
const winPercentage = (record: TeamRecord) =>
  decidedGames(record) ? (record.wins / decidedGames(record)) * 100 : 0;

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
      {decidedGames(record)
        ? `${record.wins}-${record.losses} (${winPercentage(record).toFixed(0)}%)`
        : "No graded games yet"}
    </span>
  </div>
);

// Dropdown of every team the admin selected; shows the chosen team's record
// (0-0 if none of its games have been graded yet).
const TeamRecordLookup = ({ teams }: { teams: TeamRecord[] }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>();
  const selectedRecord = teams.find((t) => t.id === selectedTeamId);

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

// One league's block: the top teams by record plus the team lookup dropdown.
const LeaguePanel = ({
  label,
  teams,
}: {
  label: string;
  teams: TeamRecord[];
}) => {
  // Rank by net wins (wins - losses) so a team that has covered in many games
  // outranks a team that has only been graded once, then break ties on win
  // percentage. Teams with no graded games yet aren't ranked.
  const top = teams
    .filter((t) => decidedGames(t) > 0)
    .sort(
      (a, b) =>
        netWins(b) - netWins(a) ||
        winPercentage(b) - winPercentage(a) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, LIST_SIZE);

  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-medium">{label}</h4>
      {top.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No graded games yet.
        </p>
      ) : (
        top.map((record) => <TeamRow key={record.id} record={record} />)
      )}
      {/* Pinned to the bottom so the dropdowns line up across leagues. */}
      <div className="mt-auto">
        <TeamRecordLookup teams={teams} />
      </div>
    </div>
  );
};

export const TeamRecords = () => {
  const trpc = useTRPC();
  const { data: teams } = useSuspenseQuery(
    trpc.analytics.getTeamRecords.queryOptions(),
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h3 className="text-lg font-medium">Team Records</h3>
        <p className="text-sm text-muted-foreground">
          How each selected team has done against the spread. A cover is a win;
          failing to cover or a push is a loss.
        </p>
      </div>

      {!teams.length ? (
        <p className="text-sm text-muted-foreground">No teams selected yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {LEAGUES.map(({ key, label }) => (
            <LeaguePanel
              key={key}
              label={label}
              teams={teams.filter((t) => t.league === key)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

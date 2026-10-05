 "use client";
import { WeeklyPlayersBarChart } from "../components/weekly-players-bar-chart";
import { TeamRecords } from "../components/team-records";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { SeasonGetOne } from "@/modules/season/type";
import { UserRecordStatsTable } from "../components/user-record-stats-table";
import { UserWeeklyBarChart } from "../components/user-weekly-bar-chart";
import { User } from "better-auth";
import { UserPickResults } from "../components/user-pick-results";
import { WeeklyPlayerPercentage } from "../components/weekly-player-percentage";
import { PickedTeamStats } from "../components/picked-team-stats";

interface AnalyticsViewProps {
  currentSeason: SeasonGetOne;
  user: User | null;
}

export const AnalyticsView = ({ currentSeason, user }: AnalyticsViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full p-4 gap-4">
      <div className="overflow-hidden rounded-md border w-full">
        <UserRecordStatsTable />
      </div>
      <div className="overflow-hidden rounded-md border w-full p-8">
        <WeeklyPlayersBarChart />
      </div>
      <div className="overflow-hidden rounded-md border w-full p-8">
        <WeeklyPlayerPercentage />
      </div>
      <div className="overflow-hidden rounded-md border w-full p-8">
        <UserWeeklyBarChart user={user} />
      </div>
      <div className="overflow-hidden rounded-md border w-full p-8">
        <UserPickResults />
      </div>
      <div className="overflow-hidden rounded-md border w-full p-8">
        <PickedTeamStats />
      </div>
      <div className="overflow-hidden rounded-md border w-full p-8">
        <TeamRecords />
      </div>
    </div>
  );
};

export const AnalyticsViewLoading = () => (
  <LoadingState
    title="Loading stats"
    description="Please wait while we fetch the stats."
  />
);

export const AnalyticsViewError = () => (
  <ErrorState
    title="Error loading stats"
    description="There was an error fetching the stats. Please try again."
  />
);

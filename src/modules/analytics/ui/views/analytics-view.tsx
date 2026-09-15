"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { SeasonGetOne } from "@/modules/season/type";
import { UserRecordStatsTable } from "../components/user-record-stats-table";
import { UserWeeklyBarChart } from "../components/user-weekly-bar-chart";
import { User } from "better-auth";
import { UserPickResults } from "../components/user-pick-results";

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
        <UserWeeklyBarChart user={user} />
      </div>
      <div className="overflow-hidden rounded-md border w-full p-8">
        <UserPickResults />
      </div>
    </div>
  );
};

export const AnalyticsViewLoading = () => (
  <LoadingState
    title="Loading games"
    description="Please wait while we fetch the game list."
  />
);

export const AnalyticsViewError = () => (
  <ErrorState
    title="Error loading games"
    description="There was an error fetching the game list. Please try again."
  />
);

"use client";
import { SeasonGetOne } from "@/modules/season/type";
import { HomeViewHeader } from "../components/home-view-header";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { WeeklyPicksSection } from "../components/weekly-picks-section";
import { UserGetOne } from "@/modules/users/types";
import { StandingsSection } from "../components/standings-section";

interface HomeViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  currentSeason: SeasonGetOne;
  user: UserGetOne;
}

export const HomeView = ({ session, currentSeason, user }: HomeViewProps) => {
  return (
    <div className="flex flex-col p-3 md:p-6 gap-3">
      <HomeViewHeader session={session} currentSeason={currentSeason} user={user} />
      <WeeklyPicksSection session={session} currentSeason={currentSeason} /> 
      <StandingsSection currentSeason={currentSeason} />     
    </div>
  );
};

export const HomeViewLoading = () => (
  <LoadingState
    title="Loading"
    description="Please wait while we load your dashboard."
  />
);

export const HomeViewError = () => (
  <ErrorState
    title="Error loading dashboard"
    description="There was an error fetching the dashboard. Please try again."
  />
);

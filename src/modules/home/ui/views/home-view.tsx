"use client";

import { SeasonGetOne } from "@/modules/season/type";
import { HomeViewHeader } from "../components/home-view-header";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { WeeklyPicksSection } from "../components/weekly-picks-section";
import { UserGetOne } from "@/modules/users/types";

interface HomeViewProps {
  session: any;
  currentSeason: SeasonGetOne;
  user: UserGetOne;
}

export const HomeView = ({ session, currentSeason, user }: HomeViewProps) => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <HomeViewHeader session={session} currentSeason={currentSeason} user={user} />
      <WeeklyPicksSection session={session} currentSeason={currentSeason} />      
    </div>
  );
};

export const HomePicksViewLoading = () => (
  <LoadingState
    title="Loading picks"
    description="Please wait while we fetch the picks."
  />
);

export const HomePicksViewError = () => (
  <ErrorState
    title="Error loading picks"
    description="There was an error fetching the picks. Please try again."
  />
);

"use client";
import { UserGetOne } from "@/modules/users/types";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

interface StandingsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSeason: any;
}

export const StandingsSection = ({ currentSeason }: StandingsSectionProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: overallStandings } = useSuspenseQuery(
    trpc.users.getOverallStandings.queryOptions()
  );

  const { data: weeklyStandings } = useSuspenseQuery(
    trpc.users.getWeeklyStandings.queryOptions({ week: currentSeason.week })
  );

  return (
    <div className="flex flex-col items-start p-4 rounded-lg border gap-3">
      <h2 className="text-md text-muted-foreground">Standings</h2>
      <div className="flex flex-col md:flex-row items-start justify-between gap-3 w-full">
        <div className="flex flex-col items-start p-2 md:p-4 rounded-lg border gap-3 md:w-1/2 w-full">
          <h2 className="text-md text-muted-foreground">Overall Standings</h2>
          <div className="w-full p-3 space-y-4">
            {overallStandings.items.length === 0 ? (
              <p className="text-muted-foreground">No standings available</p>
            ) : (
              overallStandings.items.map((user: UserGetOne) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {user.overAllPoints || 0} points
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col items-start p-2 md:p-4 rounded-lg border gap-3 md:w-1/2 w-full">
          <h2 className="text-md text-muted-foreground">
            Week {currentSeason.week - 1} results
          </h2>
          <div className="w-full p-3 space-y-4">
            {weeklyStandings.items.length === 0 ? (
              <p className="text-muted-foreground">No standings available</p>
            ) : (
              weeklyStandings.items.map((user: UserGetOne) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {user.weeklyPoints} points
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

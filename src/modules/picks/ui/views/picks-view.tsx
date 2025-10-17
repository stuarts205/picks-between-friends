"use client";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { SeasonGetOne } from "@/modules/season/type";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";

interface GamesViewProps {
  currentSeason: SeasonGetOne;
}

export const PicksView = ({ currentSeason }: GamesViewProps) => {
  const isMobile = useIsMobile();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: college } = useSuspenseQuery(
    trpc.picks.getManySelected.queryOptions({
      week: currentSeason?.week,
      league: "college-football",
      selected: true,
    })
  );

  const { data: nfl } = useSuspenseQuery(
    trpc.picks.getManySelected.queryOptions({
      week: currentSeason?.week,
      league: "nfl",
      selected: true,
    })
  );

  return (
    <>
      <div className="flex flex-col md:flex-row items-start justify-between gap-3 px-3 md:px-8 w-full">
        <div className="p-4 rounded-lg border w-full max-w-4xl mb-8">
          <h1 className="text-md font-semibold mb-4">College Games</h1>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {college.items.map((g) => (
              <div
                key={g.id}
                className="border rounded-xl p-4 bg-white shadow-sm flex flex-col items-center"
              >
                <div className="flex flex-col items-center">
                  {g.awayTeam?.logo && (
                    <Image
                      src={g.awayTeam.logo}
                      alt={g.awayTeam.name}
                      width={40}
                      height={40}
                    />
                  )}
                  <div className="text-sm font-medium mt-1">
                    {g.awayTeam?.name}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    {g.awayTeam?.nickname}
                  </div>
                </div>
                <span className="text-gray-500 text-xs my-2">&#64;</span>
                <div className="flex flex-col items-center">
                  {g.homeTeam?.logo && (
                    <Image
                      src={g.homeTeam.logo}
                      alt={g.homeTeam.name}
                      width={40}
                      height={40}
                    />
                  )}
                  <span className="text-sm font-medium mt-1">
                    {g.homeTeam?.nickname}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Spread: {g.spread}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NFL Games */}
        <div className="p-4 rounded-lg border w-full max-w-4xl mb-8">
          <h1 className="text-md font-semibold mb-4">NFL Games</h1>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {nfl.items.map((g) => (
              <div
                key={g.id}
                className="border rounded-xl p-4 bg-white shadow-sm flex flex-col items-center"
              >
                <div className="flex flex-col items-center">
                  {g.awayTeam?.logo && (
                    <Image
                      src={g.awayTeam.logo}
                      alt={g.awayTeam.name}
                      width={40}
                      height={40}
                    />
                  )}
                  <div className="text-sm font-medium mt-1">
                    {g.awayTeam?.name}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    {g.awayTeam?.nickname}
                  </div>
                </div>
                <span className="text-gray-500 text-xs my-2">&#64;</span>
                <div className="flex flex-col items-center">
                  {g.homeTeam?.logo && (
                    <Image
                      src={g.homeTeam.logo}
                      alt={g.homeTeam.name}
                      width={40}
                      height={40}
                    />
                  )}
                  <span className="text-sm font-medium mt-1">
                    {g.homeTeam?.nickname}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Spread: {g.spread}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const PicksViewLoading = () => (
  <LoadingState
    title="Loading games"
    description="Please wait while we fetch the game list."
  />
);

export const PicksViewError = () => (
  <ErrorState
    title="Error loading games"
    description="There was an error fetching the game list. Please try again."
  />
);

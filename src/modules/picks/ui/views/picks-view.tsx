"use client";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { SeasonGetOne } from "@/modules/season/type";
import Image from "next/image";

interface GamesViewProps {
  session: any;
  currentSeason: SeasonGetOne;
}

export const PicksView = ({ session, currentSeason }: GamesViewProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedPicks, setSelectedPicks] = useState<Record<string, string>>({});

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

  const collegePickMutation = useMutation(
    trpc.picks.createPick.mutationOptions({
      onSuccess: async (_, variables) => {
        setSelectedPicks((prev) => ({
          ...prev,
          [variables.gameId]: variables.teamId,
        }));
        await queryClient.invalidateQueries(
          trpc.picks.getManySelected.queryOptions({
            week: currentSeason?.week,
            league: "college-football",
            selected: true,
          })
        );
        await queryClient.invalidateQueries(
          trpc.picks.getManySelected.queryOptions({
            week: currentSeason?.week,
            league: "nfl",
            selected: true,
          })
        );
      },
    })
  );

  const renderGameCard = (g: any, league: string) => {
    const selectedTeamId = selectedPicks[g.id];
    const pickTeam =
      selectedTeamId === g.awayTeam?.id
        ? g.awayTeam
        : selectedTeamId === g.homeTeam?.id
        ? g.homeTeam
        : null;

    return (
      <div
        key={g.id}
        className="border rounded-xl p-4 bg-white shadow-sm flex flex-row justify-between items-center"
      >
        <div className="flex flex-col items-center w-2/3">
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() =>
              collegePickMutation.mutate({
                gameId: g.id,
                teamId: g.awayTeam?.id || "",
                week: currentSeason?.week || 0,
                session,
              })
            }
          >
            {g.awayTeam?.logo && (
              <Image
                src={g.awayTeam.logo}
                alt={g.awayTeam.name}
                width={40}
                height={40}
              />
            )}
            <div className="text-sm text-foreground">{g.awayTeam?.name}</div>
            <div className="text-sm text-foreground">{g.awayTeam?.nickname}</div>
          </div>

          <span className="text-gray-500 text-xs my-2">&#64;</span>

          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() =>
              collegePickMutation.mutate({
                gameId: g.id,
                teamId: g.homeTeam?.id || "",
                week: currentSeason?.week || 0,
                session,
              })
            }
          >
            {g.homeTeam?.logo && (
              <Image
                src={g.homeTeam.logo}
                alt={g.homeTeam.name}
                width={45}
                height={45}
              />
            )}
            <div className="text-sm text-foreground">{g.homeTeam?.name}</div>
            <div className="text-sm text-foreground">{g.homeTeam?.nickname}</div>
          </div>

          <div className="mt-3 text-xs text-gray-600">Spread: {g.spread}</div>
        </div>

        {/* Pick column */}
        <div className="w-1/3 flex flex-col items-center justify-center border-l pl-4">
          {g.pickedTeam ? (
            <div className="flex flex-col items-center">
              {g.pickedTeam.logo && (
                <Image
                  src={g.pickedTeam.logo}
                  alt={g.pickedTeam.name}
                  width={45}
                  height={45}
                />
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">No pick yet</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-3 px-3 md:px-8 w-full">
      <div className="p-4 rounded-lg border w-full max-w-4xl mb-8">
        <h1 className="text-md font-semibold mb-4">College Games</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {college.items.map((g) => renderGameCard(g, "college"))}
        </div>
      </div>
      <div className="p-4 rounded-lg border w-full max-w-4xl mb-8">
        <h1 className="text-md font-semibold mb-4">NFL Games</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {nfl.items.map((g) => renderGameCard(g, "nfl"))}
        </div>
      </div>
    </div>
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

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
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { getGameStatus } from "@/lib/utils";

interface GamesViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  currentSeason: SeasonGetOne;
}

export const PicksView = ({ session, currentSeason }: GamesViewProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedPicks, setSelectedPicks] = useState<Record<string, string>>(
    {}
  );
  const [showGameStartedDialog, setShowGameStartedDialog] = useState(false);

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

  const pickMutation = useMutation(
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

  const handlePick = async (
    userGameId: string,
    gameId: string,
    league: string,
    teamId: string
  ) => {
    try {
      const status = await getGameStatus(userGameId, league);
      if (status !== "STATUS_SCHEDULED") {
        setShowGameStartedDialog(true);
        return;
      }

      await pickMutation.mutateAsync({
        gameId,
        teamId: teamId || "",
        week: currentSeason?.week,
        session,
      });

    } catch (err) {
      console.error("Failed to submit pick:", err);
      alert("Something went wrong while submitting your pick.");
    }
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            onClick={() => handlePick(g.gameid, g.id, league, g.awayTeam?.id)}
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
            <div className="text-sm text-foreground">
              {g.awayTeam?.nickname}
            </div>
          </div>

          <span className="text-gray-500 text-xs my-2">&#64;</span>

          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handlePick(g.gameid, g.id, league, g.homeTeam?.id)}
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
            <div className="text-sm text-foreground">
              {g.homeTeam?.nickname}
            </div>
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
    <>
      <ResponsiveDialog
        open={showGameStartedDialog}
        onOpenChange={setShowGameStartedDialog}
        title="Game Already Started"
        description=""
      >
        <p>
          You cannot make or change picks for games that have already started.
        </p>
      </ResponsiveDialog>
      <div className="flex flex-col md:flex-row items-start justify-between gap-3 px-3 md:px-8 w-full">
        <div className="p-4 rounded-lg border w-full max-w-4xl mb-8">
          <h1 className="text-md font-semibold mb-4">College Games</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {college.items.map((g) => renderGameCard(g, "college-football"))}
          </div>
        </div>
        <div className="p-4 rounded-lg border w-full max-w-4xl mb-8">
          <h1 className="text-md font-semibold mb-4">NFL Games</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {nfl.items.map((g) => renderGameCard(g, "nfl"))}
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

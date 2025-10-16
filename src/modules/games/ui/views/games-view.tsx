"use client";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { DataTable } from "../components/data-table";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { createColumns } from "../components/columns";
import EditGameDialog from "../components/edit-game-dialog";
import type { GameGetMany } from "../../types";
import { SeasonGetOne } from "@/modules/season/type";
import { toast } from "sonner";

interface GamesViewProps {
  currentSeason: SeasonGetOne;
}

export const GamesView = ({ currentSeason }: GamesViewProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: college } = useSuspenseQuery(
    trpc.games.getMany.queryOptions({
      week: currentSeason?.week,
      league: "college-football",
    })
  );

  const { data: nfl } = useSuspenseQuery(
    trpc.games.getMany.queryOptions({
      week: currentSeason?.week,
      league: "nfl",
    })
  );

  const updateSelectGame = useMutation(
    trpc.games.selectGame.mutationOptions({
      onSuccess: async () => {
        toast.success("Game selected successfully");
        await queryClient.invalidateQueries(
          trpc.games.getMany.queryOptions({
            week: currentSeason?.week,
          })
        );
      },
    })
  );

  const updateRemoveGame = useMutation(
    trpc.games.removeGame.mutationOptions({
      onSuccess: async () => {
        toast.success("Game removed successfully");
        await queryClient.invalidateQueries(
          trpc.games.getMany.queryOptions({
            week: currentSeason?.week,
          })
        );
      },
    })
  );

  const selectGameMutation = (game: GameGetMany[number]) => {
    updateSelectGame.mutate({ id: game.id });
  };

  const removeGameMutation = (game: GameGetMany[number]) => {
    updateRemoveGame.mutate({ id: game.id });
  };

  const [updateSpread, setUpdateSpread] = useState<GameGetMany[number] | null>(
    null
  );
  const columns = createColumns({
    onEdit: (game) => setUpdateSpread(game),
    onSelect: (game) => selectGameMutation(game),
    onRemove: (game) => removeGameMutation(game),
  });

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable<GameGetMany[number], GameGetMany[number]>
        collegeData={college.items}
        nflData={nfl.items}
        columns={columns}
        noResultsMessage="No games loaded for this week"
      />

      {college.items.length === 0 && (
        <EmptyState
          title="No games loaded for this week"
          description="There are no games to display at the moment."
        />
      )}

      {updateSpread && (
        <EditGameDialog
          open={!!updateSpread}
          onOpenChange={(open) => !open && setUpdateSpread(null)}
          game={updateSpread}
        />
      )}
    </div>
  );
};

export const GamesViewLoading = () => (
  <LoadingState
    title="Loading games"
    description="Please wait while we fetch the game list."
  />
);

export const GamesViewError = () => (
  <ErrorState
    title="Error loading games"
    description="There was an error fetching the game list. Please try again."
  />
);

"use client";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "../components/data-table";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { createColumns } from "../components/columns";
import EditGameDialog from "../components/edit-game-dialog";
import type { GameGetMany } from "../../types";

export const GamesView = () => {
  const trpc = useTRPC();
  const { data: season } = useQuery(trpc.season.getOne.queryOptions());
  const { data: college } = useSuspenseQuery(
    trpc.games.getMany.queryOptions({ week: season?.week, league: "college-football" })
  );
  const { data: nfl } = useSuspenseQuery(
    trpc.games.getMany.queryOptions({ week: season?.week, league: "nfl" })
  );
  const [selectedGame, setSelectedGame] = useState<GameGetMany[number] | null>(null);
  const columns = createColumns({
    onEdit: (game) => setSelectedGame(game),
    onSelect: (game) => console.log("Selected game", game),
    onRemove: (game) => console.log("Removed game", game),
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

      {selectedGame && (
        <EditGameDialog
          open={!!selectedGame}
          onOpenChange={(open) => !open && setSelectedGame(null)}
          game={selectedGame}
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

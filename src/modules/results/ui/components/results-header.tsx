"use client";
import { Button } from "@/components/ui/button";
import { gamesUpdateWinnerSchema } from "@/modules/games/schemas";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ResultsTable } from "./results-table";

interface ResultsHeaderProps {
  week?: number;
}

export const ResultsHeader = ({ week }: ResultsHeaderProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: games } = useSuspenseQuery(
    trpc.results.getManyWeeklySelectedGames.queryOptions({
      week,
    })
  );
  const {data: updatedResults} = useSuspenseQuery(
    trpc.results.getUpdatedResults.queryOptions()
  )
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const updateMutation = useMutation(
    trpc.results.updateMany.mutationOptions({
      onSuccess: async () => {
        toast.success("Results updated successfully");
        setIsLoading(false);
        setIsUpdated(true);
        await queryClient.invalidateQueries(
          trpc.results.getUpdatedResults.queryOptions()
        );
      },
    })
  );

  type GameInput = z.infer<typeof gamesUpdateWinnerSchema>;

  const handleGetResults = async () => {
    setIsLoading(true);
    const gameToUpdate: GameInput[] = games.map((game) => ({
      id: game.id,
      gameId: game.gameId ?? "",
      league: game.league ?? "",
    }));
    updateMutation.mutate(gameToUpdate);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-5">
        <div>
          <h5 className="font-medium text-xl">Results for Week {week}</h5>
        </div>
        <div>
          <Button onClick={() => handleGetResults()} disabled={isLoading}>
            Get week {week} results
            {isLoading && (
              <Loader2Icon className="animate-spin size-6 text-white" />
            )}
          </Button>
        </div>        
      </div>
      <ResultsTable updatedResults={updatedResults} isUpdated={isUpdated} />
    </div>
  );
};

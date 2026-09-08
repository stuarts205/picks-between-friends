"use client";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import React, { useState } from "react";
import { NewMeetingDialog } from "./new-game-dialog";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const GamesListHeader = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: season } = useQuery(trpc.season.getOne.queryOptions());
  const { data: games } = useSuspenseQuery(
    trpc.games.getMany.queryOptions({ week: season?.week }),
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadGamesMutation = useMutation(
    trpc.games.loadForCurrentWeek.mutationOptions({
      onSuccess: async (createdGames) => {
        await queryClient.invalidateQueries(
          trpc.games.getMany.queryOptions({ week: season?.week }),
        );
        if (createdGames.length === 0) {
          toast.error("No games found for this week");
        } else {
          toast.success("Games loaded successfully");
        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(`Error loading games: ${error.message}`);
        setIsLoading(false);
      },
    }),
  );

  const loadGames = () => {
    setIsLoading(true);
    loadGamesMutation.mutate();
  };

  return (
    <>
      <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="py-4 px-4 md:px-8 flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-xl">Games</h5>
          </div>
          <div className="flex gap-x-3">
            {games.items.length == 0 && (
              <Button onClick={() => loadGames()}>
                Load week {season?.week} games
                {isLoading && (
                  <Loader2Icon className="animate-spin size-6 text-white" />
                )}
              </Button>
            )}
            {/* <Button onClick={() => setIsDialogOpen(true)}>
              <PlusIcon /> New Game
            </Button> */}
          </div>
        </div>
        <div className="flex items-center gap-x-2 p-1"></div>
      </div>
    </>
  );
};

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
import { getGames } from "@/lib/utils";
import { gamesInsertSchema } from "../../schemas";
import z from "zod";

export const GamesListHeader = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: season } = useQuery(trpc.season.getOne.queryOptions());
  const { data: games } = useSuspenseQuery(
    trpc.games.getMany.queryOptions({ week: season?.week }),
  );
  const [isLoading, setIsLoading] = useState(false);

  const createGames = useMutation(
    trpc.games.createMany.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.games.getMany.queryOptions({ week: season?.week }),
        );
        toast.success("Games loaded successfully");
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(`Error creating game: ${error.message}`);
      },
    }),
  );

  type GameInput = z.infer<typeof gamesInsertSchema>;

  const loadGames = async () => {
    setIsLoading(true);
    if (!season) {
      toast.error("Season data is not available yet");
      setIsLoading(false);
      return;
    }
    const games = await getGames(season);
    if (games.length === 0) {
      toast.error("No games found for this week");
      setIsLoading(false);
      return;
    }

    const formattedGames: GameInput[] = games.map((game) => ({
      gameId: game.competitions[0].id,
      week: season?.week || 1,
      league: game.league,
      home: game.competitions[0].competitors[0].team.shortDisplayName,
      away: game.competitions[0].competitors[1].team.shortDisplayName,
      spread: game.competitions[0].odds?.[0]?.spread
        ? game.competitions[0].odds[0].spread.toString()
        : "0",
      favorite: game.competitions[0].odds?.[0]?.details
        ? game.competitions[0].odds[0].details.split(" ")[0]
        : "N/A",
    }));

    createGames.mutate(
      formattedGames as unknown as z.infer<typeof gamesInsertSchema>[],
    );
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

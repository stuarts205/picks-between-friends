"use client";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import React, { useState } from "react";
import Image from "next/image";

interface WeeklyPicksSectionProps {
  session: any;
  currentSeason: any;
}

export const WeeklyPicksSection = ({
  session,
  currentSeason,
}: WeeklyPicksSectionProps) => {
  const [selectedPicks, setSelectedPicks] = useState<Record<string, string>>(
    {}
  );
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

  const renderGameCard = (g: any, league: string) => {
    return (
      <div
        key={g.gameId}
        className="flex flex-col items-center p-3 md:p-5 w-full"
      >
        <div className="flex justify-between items-center gap-5 w-full">
          <div className="relative w-8 h-8 md:w-[45px] md:h-[45px]">
            <Image
              src={g.awayTeam.logo}
              alt={g.awayTeam.name}
              fill
              className="object-contain cursor-pointer"
              onClick={() =>
                pickMutation.mutate({
                  gameId: g.id,
                  teamId: g.awayTeam?.id || "",
                  week: currentSeason?.week || 0,
                  session,
                })
              }
            />
          </div>
          <div className="text-muted-foreground text-sm md:text-lg">@</div>
          <div className="relative w-8 h-8 md:w-[45px] md:h-[45px]">
            <Image
              src={g.homeTeam.logo}
              alt={g.homeTeam.name}
              fill
              className="object-contain cursor-pointer"
              onClick={() =>
                pickMutation.mutate({
                  gameId: g.id,
                  teamId: g.homeTeam?.id || "",
                  week: currentSeason?.week || 0,
                  session,
                })
              }
            />
          </div>
          <div className="text-muted-foreground text-sm md:text-lg">
            {g.spread}
          </div>
          <div className="relative w-8 h-8 md:w-[45px] md:h-[45px]">
            <Image
              src={g.pickedTeam.logo}
              alt={g.pickedTeam.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col items-start p-4 rounded-lg border gap-3">
        <h2 className="text-md text-muted-foreground">This week's picks</h2>
        <div className="w-full flex flex-col md:flex-row justify-between items-start gap-3">
          <div className="flex flex-col items-start p-2 md:p-4 rounded-lg border w-full md:w-1/2 gap-3">
            <p className="text-muted-foreground">College</p>
            <div className="w-full p-3 space-y-4">
              {college.items.length === 0 ? (
                <p className="text-muted-foreground">
                  You haven't made any picks yet
                </p>
              ) : null}
              {college.items.map((g) => renderGameCard(g, "college"))}
            </div>
          </div>
          <div className="flex flex-col items-start p-4 rounded-lg border w-full md:w-1/2 gap-3">
            <p className="text-muted-foreground">NFL</p>
            <div className="w-full p-3 space-y-4">
              {nfl.items.length === 0 ? (
                <p className="text-muted-foreground">
                  You haven't made any picks yet
                </p>
              ) : null}
              {nfl.items.map((g) => renderGameCard(g, "nfl"))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

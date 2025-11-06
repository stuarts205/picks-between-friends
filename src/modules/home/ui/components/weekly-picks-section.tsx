"use client";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import Image from "next/image";

interface WeeklyPicksSectionProps {
  session: any;
  currentSeason: any;
}

export const WeeklyPicksSection = ({
  session,
  currentSeason,
}: WeeklyPicksSectionProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: college } = useSuspenseQuery(
    trpc.home.getManyPicks.queryOptions({
      week: currentSeason?.week,
      league: "College",
      session,
    })
  );

  const { data: nfl } = useSuspenseQuery(
    trpc.home.getManyPicks.queryOptions({
      week: currentSeason?.week,
      league: "NFL",
      session,
    })
  );

  console.log(college)

  const renderGameCard = (g: any, league: string) => {
    return (
      <div key={g.gameId} className="flex flex-col items-center p-5 w-full">
        <div className="flex justify-between items-center gap-2 w-full">
          <div>
            <Image
              src={g.awayTeamLogo}
              alt={g.awayTeamName}
              width={45}
              height={45}
            />
          </div>
          <div>@</div>
          <div>
            <Image
              src={g.homeTeamLogo}
              alt={g.homeTeamName}
              width={45}
              height={45}
            />
          </div>
          <div>
            <Image
              src={g.pickedTeamLogo}
              alt={g.pickedTeamName}
              width={45}
              height={45}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col items-start p-4 rounded-lg border gap-3">
        <h2 className="text-md font-bold">This week's picks</h2>
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex flex-col items-start p-4 rounded-lg border w-full gap-3">
            <p className="text-muted-foreground">College</p>
            <div className="w-full p-3">{college.items.map((g) => renderGameCard(g, "college"))}</div>
          </div>
          <div className="flex flex-col items-start p-4 rounded-lg border w-full gap-3">
            <p className="text-muted-foreground">NFL</p>
            <div className="w-full p-3">{nfl.items.map((g) => renderGameCard(g, "nfl"))}</div>
          </div>
        </div>
      </div>
    </>
  );
};

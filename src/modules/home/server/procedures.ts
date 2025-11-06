import { db } from "@/db";
import { pick, team, game } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { eq, and, getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const homeRouter = createTRPCRouter({
  getManyPicks: protectedProcedure
  .input(
    z.object({
      week: z.number().nullish(),
      league: z.string(),
      session: z.any(),
    })
  )
  .query(async ({ input }) => {
    const { week, league, session } = input;

    // Aliases for team table (so we can join twice)
    const homeTeam = alias(team, "homeTeam");
    const awayTeam = alias(team, "awayTeam");

    const picks = await db
      .select({
        gameId: game.id,
        gameWeek: game.week,
        pickId: pick.id,
        pickedTeamId: pick.teamId,
        pickedTeamName: team.name,
        pickedTeamLogo: team.logo,
        homeTeamName: homeTeam.name,
        homeTeamLogo: homeTeam.logo,
        awayTeamName: awayTeam.name,
        awayTeamLogo: awayTeam.logo,
      })
      .from(pick)
      .innerJoin(game, eq(pick.gameId, game.id))
      .innerJoin(team, eq(pick.teamId, team.id)) // user's pick
      .innerJoin(homeTeam, eq(game.homeId, homeTeam.id))
      .innerJoin(awayTeam, eq(game.awayId, awayTeam.id))
      .where(
        and(
          eq(pick.userId, session.user.id),
          eq(team.league, league),
          week ? eq(pick.week, week) : undefined
        )
      );

    return { items: picks };
  }),
});

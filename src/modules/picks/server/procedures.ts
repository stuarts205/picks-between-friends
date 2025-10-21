import { db } from "@/db";
import { game, pick, session, team, user } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import z from "zod";
import { eq, getTableColumns, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const picksRouter = createTRPCRouter({
  createPick: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        teamId: z.string(),
        week: z.number(),
        session: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      const { gameId, teamId, week, session } = input;

      if (!gameId || !teamId) {
        throw new Error("Invalid input");
      }

      const [newPick] = await db
      .insert(pick)
      .values({
        id: crypto.randomUUID(), 
        gameId: gameId,
        teamId: teamId,
        userId: session.user.id,
        userName: session.user.name,
        week: week,
      })
      .returning();

      return newPick;

    }),
  getManySelected: protectedProcedure
  .input(
    z.object({
      week: z.number().nullish(),
      league: z.string().nullish(),
      selected: z.boolean().optional(),
    })
  )
  .query(async ({ input }) => {
    const { week, league, selected } = input;

    const homeTeam = alias(team, "homeTeam");
    const awayTeam = alias(team, "awayTeam");

    const data = await db
      .select({
        ...getTableColumns(game),
        homeTeam: {
          id: homeTeam.id,
          name: homeTeam.name,
          nickname: homeTeam.nickname,
          abbreviation: homeTeam.abbreviation,
          logo: homeTeam.logo,
          conference: homeTeam.conference,
          league: homeTeam.league,
        },
        awayTeam: {
          id: awayTeam.id,
          name: awayTeam.name,
          nickname: awayTeam.nickname,
          abbreviation: awayTeam.abbreviation,
          logo: awayTeam.logo,
          conference: awayTeam.conference,
          league: awayTeam.league,
        },
      })
      .from(game)
      .leftJoin(homeTeam, eq(game.homeId, homeTeam.id))
      .leftJoin(awayTeam, eq(game.awayId, awayTeam.id))
      .where(
        and(
          week ? eq(game.week, week) : undefined,
          league ? eq(game.league, league) : undefined,
          selected === true ? eq(game.selected, true) : undefined
        )
      )
      .orderBy(game.gameid);

    return { items: data };
  }),
});

import { db } from "@/db";
import { game, pick, team } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const analyticsRouter = createTRPCRouter({
  getPicksByWeekByUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.auth.user.id;

      const homeTeam = alias(team, "homeTeam");
      const awayTeam = alias(team, "awayTeam");

      const userPicks = await db
        .select({
          ...getTableColumns(pick),
          homeTeam: {
            id: homeTeam.id,
            name: homeTeam.name,
            abbreviation: homeTeam.abbreviation,
            logo: homeTeam.logo,
            color: homeTeam.color,
          },
          awayTeam: {
            id: awayTeam.id,
            name: awayTeam.name,
            abbreviation: awayTeam.abbreviation,
            logo: awayTeam.logo,
            color: awayTeam.color,
          },
          push: game.push,
          league: game.league,
        })
        .from(pick)
        .leftJoin(game, eq(pick.gameId, game.id))
        .leftJoin(homeTeam, eq(game.homeId, homeTeam.id))
        .leftJoin(awayTeam, eq(game.awayId, awayTeam.id))
        .where(eq(pick.userId, userId));

      const picksByWeek = new Map<number, typeof userPicks>();
      userPicks.forEach((pickItem) => {
        const weekPicks = picksByWeek.get(pickItem.week) ?? [];
        weekPicks.push(pickItem);
        picksByWeek.set(pickItem.week, weekPicks);
      });

      return Array.from(picksByWeek.entries())
        .map(([week, picks]) => ({ week, picks }))
        .sort((a, b) => a.week - b.week);
    }),
  getManyForOverall: protectedProcedure
    .query(async ({ input }) => {
      const data = await db.select().from(pick);
      return { items: data };
    }),
  getWeeklyPointsForUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.auth.user.id;
      const userPicks = await db
        .select()
        .from(pick)
        .where(eq(pick.userId, userId));

      const weeklyPoints = new Map<number, number>();
      userPicks.forEach((pickItem) => {
        const points = weeklyPoints.get(pickItem.week) ?? 0;
        weeklyPoints.set(
          pickItem.week,
          pickItem.win === true ? points + 1 : points,
        );
      });

      return Array.from(weeklyPoints.entries())
        .map(([week, points]) => ({ week, points }))
        .sort((a, b) => a.week - b.week);
    }),
});

import { db } from "@/db";
import { game, pick, season } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { eq, and } from "drizzle-orm";
import { gamesUpdateManySchema } from "@/modules/games/schemas";
import { gradeGames } from "./grade-games";

export const resultsRouter = createTRPCRouter({
  getUpdatedResults: protectedProcedure
    .query(async () => {
      const [currentWeek] = await db.select().from(season).limit(1);
      if (!currentWeek) return [];

      const picksForWeek = await db
        .select({
          userId: pick.userId,
          userName: pick.userName,
          win: pick.win,
        })
        .from(pick)
        .where(eq(pick.week, currentWeek.week));

      const resultsByUser = new Map<
        string,
        {
          userId: string;
          userName: string | null;
          totalWins: number;
          totalLosses: number;
        }
      >();

      for (const pickItem of picksForWeek) {
        const entry = resultsByUser.get(pickItem.userId) ?? {
          userId: pickItem.userId,
          userName: pickItem.userName,
          totalWins: 0,
          totalLosses: 0,
        };

        if (pickItem.win === true) entry.totalWins++;
        if (pickItem.win === false) entry.totalLosses++;

        resultsByUser.set(pickItem.userId, entry);
      }

      return Array.from(resultsByUser.values());
    }),
  updateMany: protectedProcedure
    .input(gamesUpdateManySchema)
    .mutation(
      async ({ input }: { input: z.infer<typeof gamesUpdateManySchema> }) => {
        return gradeGames(input);
      }
    ),
  getManyWeeklySelectedGames: protectedProcedure
    .input(z.object({ week: z.number().optional() }))
    .query(async ({ input }) => {
      const week = input.week;

      const selectedGames = await db
        .select({
          id: game.id,
          gameId: game.gameid,
          league: game.league,
        })
        .from(game)
        .where(
          and(week ? eq(game.week, week) : undefined, eq(game.selected, true))
        );

      return selectedGames;
    }),
});

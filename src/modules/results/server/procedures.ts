import { db } from "@/db";
import { game, pick, season, team, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { eq, and } from "drizzle-orm";
import { getGameScores } from "@/lib/utils";
import { gamesUpdateManySchema } from "@/modules/games/schemas";

export const resultsRouter = createTRPCRouter({
  getUpdatedResults: protectedProcedure
    .query(async () => {
      const [currentWeek] = await db.select().from(season).limit(1);
      const usersWithPicks = await db
          .select()
          .from(user)
          .where(eq(user.week, currentWeek.week));
        const results = await Promise.all(
          usersWithPicks.map(async (userItem) => {
            const totalWins = await db
              .select()
              .from(pick)
              .where(
                and(
                  eq(pick.userId, userItem.id),
                  eq(pick.week, currentWeek.week),
                  eq(pick.win, true)
                )
              );
              const totalLosses = await db
                .select()
                .from(pick)
                .where(
                  and(
                    eq(pick.userId, userItem.id),
                    eq(pick.week, currentWeek.week),
                    eq(pick.win, false)
                  )
                );

              return {
                userId: userItem.id,
                userName: userItem.name,
                totalWins: totalWins.length,
                totalLosses: totalLosses.length,
              };
          })
        )

        return results;
    }),
  updateMany: protectedProcedure
    .input(gamesUpdateManySchema)
    .mutation(
      async ({ input }: { input: z.infer<typeof gamesUpdateManySchema> }) => {
        for (const selectedGame of input) {
          if (!selectedGame.gameId) continue;
          const didCover = await getGameScores(
            selectedGame.gameId,
            selectedGame.league || "",
            selectedGame.id
          );

          await db
            .update(game)
            .set({
              winner: didCover?.team.team.slug ?? null,
              favoriteWin: didCover?.covered ?? null,
            })
            .where(eq(game.id, selectedGame.id));
        }

        const [currentWeek] = await db.select().from(season).limit(1);

        const usersWithPicks = await db
          .select()
          .from(user)
          .where(eq(user.week, currentWeek.week));

        for (const userItem of usersWithPicks) {
          const picksForUser = await db
            .select()
            .from(pick)
            .innerJoin(game, eq(pick.gameId, game.id))
            .innerJoin(team, eq(pick.teamId, team.id))
            .where(
              and(eq(pick.userId, userItem.id), eq(pick.week, currentWeek.week))
            );

          for (const pickItem of picksForUser) {
            await db
              .update(pick)
              .set({
                win:
                  pickItem.pick.teamSlug === pickItem.game.winner
                    ? true
                    : false,
              })
              .where(eq(pick.id, pickItem.pick.id));
          }
        }
      }
    ),
  getManyWeeklySelectedGames: protectedProcedure
    .input(z.object({ week: z.number().optional() }))
    .query(async ({ input }) => {
      const week = input.week;

      const usersWithPicks = await db
        .select()
        .from(user)
        .where(and(week ? eq(user.week, week) : undefined));

      for (const userItem of usersWithPicks) {
        const picksForUser = await db
          .select()
          .from(pick)
          .where(
            and(
              eq(pick.userId, userItem.id),
              week ? eq(pick.week, week) : undefined
            )
          );

        for (const pickItem of picksForUser) {
          const [gameItem] = await db
            .select()
            .from(game)
            .where(eq(game.id, pickItem.gameId));

          const [pickedGame] = await db
            .select()
            .from(game)
            .where(eq(game.id, pickItem.gameId));

          if (!gameItem || !gameItem.gameid || !gameItem.league) continue;

          if (!pickedGame || !pickedGame.gameid) continue;
          const results = await getGameScores(
            pickedGame.gameid,
            gameItem.league,
            gameItem.id
          );
          if (!results) continue;
        }
      }

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

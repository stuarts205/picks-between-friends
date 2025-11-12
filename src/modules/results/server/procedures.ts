import { db } from "@/db";
import { game, pick, season, team, user } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import z from "zod";
import { eq, getTableColumns, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getGameScores } from "@/lib/utils";

export const resultsRouter = createTRPCRouter({
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
              .where(eq(game.id, pickItem.gameId))    

              const [pickedGame] = await db
              .select()
              .from(game)
              .where(eq(game.id, pickItem.gameId))   

              if (!gameItem || !gameItem.gameid || !gameItem.league) continue;

              if (!pickedGame || !pickedGame.gameid) continue;
              const results = await getGameScores(pickedGame.gameid, gameItem.league);
              console.log('results', results);
              if(!results) continue;            
            
          }
      }

      const selectedGames = await db
        .select({
          gameId: game.gameid,
          league: game.league,
        })
        .from(game)
        .where(
          and(week ? eq(game.week, week) : undefined, eq(game.selected, true))
        );

      for (const selectedGame of selectedGames) {
        if (!selectedGame.gameId) continue;
        const didCover = await getGameScores(
          selectedGame.gameId,
          selectedGame.league
        );
      }

      return selectedGames;
    }),
});

import { db } from "@/db";
import { game, team } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { eq, getTableColumns, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  gamesInsertManySchema,
  gamesInsertSchema,
  gamesUpdateSchema,
} from "../schemas";

export const gamesRouter = createTRPCRouter({
  updateSpread: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        spread: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ctxUser = ctx.auth.user;
      const [currentGame] = await db
        .select()
        .from(game)
        .where(eq(game.id, input.id))
        .limit(1);

      if (!currentGame) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Game not found in database",
        });
      }

      // if (ctxUser.role !== 1) {
      //   throw new TRPCError({
      //     code: "FORBIDDEN",
      //     message: "Not authorized to update game",
      //   });
      // }

      const [updatedGame] = await db
        .update(game)
        .set({ spread: input.spread })
        .where(eq(game.id, input.id))
        .returning();
        
      return updatedGame;
    }),
  createMany: protectedProcedure
    .input(gamesInsertManySchema)
    .mutation(
      async ({ input }: { input: z.infer<typeof gamesInsertManySchema> }) => {
        const createdGames = [];
        for (const gameInput of input) {
          const isNFL = gameInput.league.toLowerCase().includes("nfl");

          const [homeTeam] = await db
            .select()
            .from(team)
            .where(
              and(
                eq(isNFL ? team.nickname : team.name, gameInput.home),
                eq(team.league, isNFL ? "NFL" : "College")
              )
            )
            .limit(1);

          const [awayTeam] = await db
            .select()
            .from(team)
            .where(
              and(
                eq(isNFL ? team.nickname : team.name, gameInput.away),
                eq(team.league, isNFL ? "NFL" : "College")
              )
            )
            .limit(1);

          if (!homeTeam || !awayTeam) {
            continue;
          }

          if (gameInput.spread === "0" || gameInput.spread === "") {
            continue;
          }

          const [createdGame] = await db
            .insert(game)
            .values({
              id: crypto.randomUUID(),
              week: gameInput.week,
              league: gameInput.league,
              home: isNFL ? homeTeam.nickname : homeTeam.name,
              away: isNFL ? awayTeam.nickname : awayTeam.name,
              spread: gameInput.spread,
              homeId: homeTeam.id,
              awayId: awayTeam.id,
              favorite: gameInput.favorite,
              gameid: gameInput.gameId,
            })
            .returning();

          createdGames.push(createdGame);
        }
        return createdGames;
      }
    ),
  update: protectedProcedure
    .input(gamesUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const ctxUser = ctx.auth.user;
      const [currentGame] = await db
        .select()
        .from(game)
        .where(eq(game.id, input.id))
        .limit(1);

      if (!currentGame) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Game not found in database",
        });
      }

      // if (ctxUser.role !== 1) {
      //   throw new TRPCError({
      //     code: "FORBIDDEN",
      //     message: "Not authorized to update game",
      //   });
      // }

      const [updatedGame] = await db
        .update(game)
        .set(input)
        .where(eq(game.id, input.id))
        .returning();

      return updatedGame;
    }),
  create: protectedProcedure
    .input(gamesInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [homeId] = await db
        .select()
        .from(team)
        .where(eq(team.id, input.home))
        .limit(1);

      const [awayId] = await db
        .select()
        .from(team)
        .where(eq(team.id, input.away))
        .limit(1);

      const [createdGame] = await db
        .insert(game)
        .values({
          id: crypto.randomUUID(),
          week: input.week,
          league: input.league,
          home: homeId.name,
          away: awayId.name,
          spread: input.spread,
          homeId: homeId.id,
          awayId: awayId.id,
          favorite: input.favorite,
          gameid: input.gameId,
        })
        .returning();
      return createdGame;
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [existingGame] = await db
        .select({
          ...getTableColumns(game),
        })
        .from(game)
        .where(eq(game.id, input.id));

      if (!existingGame) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }

      return existingGame;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        week: z.number().nullish(),
        league: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { week, league } = input;
      const data = await db
        .select()
        .from(game)
        .where(
          and(
            week ? eq(game.week, week) : undefined,
            league ? eq(game.league, league) : undefined
          )
        );

      return {
        items: data,
      };
    }),
});

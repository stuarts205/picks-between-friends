import { db } from "@/db";
import { game, team } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { eq, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { gamesInsertSchema, gamesUpdateSchema } from "../schemas";

export const gamesRouter = createTRPCRouter({
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
        week: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { week } = input;
      const data = await db
        .select()
        .from(game)
        .where(week != null ? eq(game.week, Number(week)) : undefined);

      return {
        items: data,
      };
    }),
});

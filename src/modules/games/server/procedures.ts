import { db } from "@/db";
import { game, user } from "@/db/schema";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import z from "zod";
import { eq, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const gamesRouter = createTRPCRouter({
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
    .input(z.object({
        week: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {  week } = input;
      const data = await db
        .select()
        .from(game)
        .where(week != null ? eq(game.week, Number(week)) : undefined)

      return {
        items: data,
      };
    }),
});

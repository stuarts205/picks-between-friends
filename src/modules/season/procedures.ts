import { db } from "@/db";
import { season, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";

// Labor Day is the first Monday of September; the new season starts on the
// Monday before it. Returned in the same format the season table already uses.
function mondayBeforeLaborDay(year: number): string {
  const septemberFirstDay = new Date(Date.UTC(year, 8, 1)).getUTCDay();
  const laborDay = 1 + ((1 - septemberFirstDay + 7) % 7);
  const start = new Date(Date.UTC(year, 8, laborDay - 7));
  const yyyy = start.getUTCFullYear();
  const mm = String(start.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(start.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} 00:00:00.0000000`;
}

export const seasonRouter = createTRPCRouter({
  getOne: protectedProcedure
    .query(async () => {
      const [currentSeason] = await db
        .select()
        .from(season)

      if (!currentSeason) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Current season not found" });
      }

      return currentSeason;
    }),
  resetYear: protectedProcedure.mutation(async ({ ctx }) => {
    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, ctx.auth.user.id))
      .limit(1);

    if (!currentUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found in database",
      });
    }

    if (currentUser.role !== 1) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to reset the year",
      });
    }

    const [currentSeason] = await db.select().from(season).limit(1);

    if (!currentSeason) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Current season not found",
      });
    }

    const nextYear = currentSeason.year + 1;

    await db.batch([
      db.execute(
        sql`TRUNCATE TABLE "user", "session", "account", "pick", "comment", "game"`,
      ),
      db
        .update(season)
        .set({
          year: nextYear,
          week: 1,
          startDate: mondayBeforeLaborDay(nextYear),
        })
        .where(eq(season.id, currentSeason.id)),
    ]);

    return { year: nextYear };
  }),
});

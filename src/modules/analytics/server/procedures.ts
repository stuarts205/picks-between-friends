import { db } from "@/db";
import { pick } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq } from "drizzle-orm";

export const analyticsRouter = createTRPCRouter({
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

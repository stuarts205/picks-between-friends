import { db } from "@/db";
import { season } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

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
});
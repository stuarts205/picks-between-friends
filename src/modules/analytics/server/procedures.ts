import { db } from "@/db";
import { pick } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { eq } from "drizzle-orm";

export const analyticsRouter = createTRPCRouter({
  getManyForOverall: protectedProcedure    
    .query(async ({ input }) => {
      const data = await db.select().from(pick);
      return { items: data };
    }),
});

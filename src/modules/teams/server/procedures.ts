import { db } from "@/db";
import { team } from "@/db/schema";
import {
  createTRPCRouter,
  baseProcedure,
} from "@/trpc/init";
import z from "zod";
import { eq, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const teamsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const [existingTeam] = await db
        .select({
          ...getTableColumns(team),
        })
        .from(team)
        .where(eq(team.name, input.name));

      if (!existingTeam) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      }

      return existingTeam;
    }),
  getMany: baseProcedure
    .input(z.object({ league: z.string() }))
    .query(async ({ input }) => {
      const { league } = input;
      const teams = await db.select().from(team).where(eq(team.league, league));

      if (teams.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No teams found for the specified league",
        });
      }

      return teams;
    }),
});

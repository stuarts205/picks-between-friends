import { db } from "@/db";
import { user } from "@/db/schema";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { usersInsertSchema } from "../schemas";
import z from "zod";
import { eq, getTableColumns } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [existingUser] = await db
        .select({
          ...getTableColumns(user),
        })
        .from(user)
        .where(eq(user.id, input.id));
      return existingUser;
    }),
  getMany: protectedProcedure.query(async () => {
    const data = await db.select().from(user);
    return data;
  }),
  create: protectedProcedure
    .input(usersInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdUser] = await db
        .insert(user)
        .values({
          id: crypto.randomUUID(),
          ...input,
        })
        .returning();
      return createdUser;
    }),
});

import { db } from "@/db";
import { user } from "@/db/schema";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { usersInsertSchema } from "../schemas";
import z from "zod";
import { eq, getTableColumns, and, ilike, desc, count } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";

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
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const data = await db
        .select()
        .from(user)
        .where(
          and(
            search ? ilike(user.name, `%${search}%`) : undefined
          )
        )
        .orderBy(user.name)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(user)
        .where(
          and(
            search ? ilike(user.name, `%${search}%`) : undefined
          )
        );

        const totalPages = Math.ceil(total?.count / pageSize) || 1;

      return {
        items: data,
        total: total?.count ?? 0,
        totalPages,
      };
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

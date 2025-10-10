import { db } from "@/db";
import { user } from "@/db/schema";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { usersInsertSchema, usersUpdateSchema } from "../schemas";
import z from "zod";
import { eq, getTableColumns, and, ilike, desc, count } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  update: protectedProcedure
    .input(usersUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const ctxUser = ctx.auth.user;
      const [currentUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, ctxUser.id))
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
          message: "Not authorized to update user",
        });
      }

      if (currentUser.id === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Admins cannot delete their own account",
        });
      }
      const [updatedUser] = await db
        .update(user)
        .set(input)
        .where(eq(user.id, input.id))
        .returning();

      return updatedUser;
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ctxUser = ctx.auth.user;
      const [currentUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, ctxUser.id))
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
          message: "Not authorized to remove user",
        });
      }

      if (currentUser.id === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Admins cannot delete their own account",
        });
      }

      const [removedUser] = await db
        .delete(user)
        .where(eq(user.id, input.id))
        .returning();

      if (!removedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return removedUser;
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [existingUser] = await db
        .select({
          ...getTableColumns(user),
        })
        .from(user)
        .where(eq(user.id, input.id));

      if (!existingUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

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
        .where(and(search ? ilike(user.name, `%${search}%`) : undefined))
        .orderBy(user.name)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(user)
        .where(and(search ? ilike(user.name, `%${search}%`) : undefined));

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

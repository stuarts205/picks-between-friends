import { db } from "@/db";
import { account, session, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { usersInsertSchema, usersUpdateSchema } from "../schemas";
import z from "zod";
import { eq, getTableColumns, and, ilike, desc, count, or } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  getWeeklyStandings: baseProcedure
    .input(z.object({ week: z.number() }))
    .query(async ({ input }) => {
      const data = await db
        .select()
        .from(user)
        .where(or(eq(user.week, input.week), eq(user.week, input.week - 1)))
        .orderBy(desc(user.weeklyPoints));

      return {
        items: data,
      };
    }),
  getOverallStandings: baseProcedure.query(async () => {
    const data = await db.select().from(user).orderBy(desc(user.overAllPoints));
    return {
      items: data,
    };
  }),
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
      const { id, ...values } = input;
      const [updatedUser] = await db
        .update(user)
        .set(values)
        .where(eq(user.id, id))
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
  requestPasswordReset: protectedProcedure
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
          message: "Not authorized to reset passwords",
        });
      }

      const [targetUser] = await db
        .select({
          id: user.id,
          email: user.email,
        })
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const hostUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      await auth.api.requestPasswordReset({
        body: {
          email: targetUser.email,
          redirectTo: `${hostUrl}/password-reset-form`,
        },
      });

      return { success: true };
    }),
  setPassword: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        newPassword: z.string().min(8).max(128),
      }),
    )
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
          message: "Not authorized to set passwords",
        });
      }

      const [targetUser] = await db
        .select({
          id: user.id,
        })
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const hashedPassword = await hashPassword(input.newPassword);
      const [credentialAccount] = await db
        .select({
          id: account.id,
        })
        .from(account)
        .where(
          and(
            eq(account.userId, targetUser.id),
            eq(account.providerId, "credential"),
          ),
        )
        .limit(1);

      if (credentialAccount) {
        await db
          .update(account)
          .set({
            password: hashedPassword,
            updatedAt: new Date(),
          })
          .where(eq(account.id, credentialAccount.id));
      } else {
        await db.insert(account).values({
          id: crypto.randomUUID(),
          accountId: targetUser.id,
          providerId: "credential",
          userId: targetUser.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await db.delete(session).where(eq(session.userId, targetUser.id));

      return { success: true };
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
  getOneBySession: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;
    const [existingUser] = await db
      .select({
        ...getTableColumns(user),
      })
      .from(user)
      .where(eq(user.id, userId));

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
      }),
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

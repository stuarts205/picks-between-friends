import { db } from "@/db";
import { comment, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { desc, eq } from "drizzle-orm";
import { commentInsertSchema } from "../schemas";

const COMMENT_LIST_LIMIT = 100;

export const commentRouter = createTRPCRouter({
    getMany: protectedProcedure
        .query(async () => {
            const data = await db
                .select({
                    id: comment.id,
                    userId: comment.userId,
                    userName: user.name,
                    savedUserName: comment.userName,
                    userImage: user.image,
                    content: comment.content,
                    createdAt: comment.createdAt,
                })
                .from(comment)
                .leftJoin(user, eq(comment.userId, user.id))
                .orderBy(desc(comment.createdAt))
                .limit(COMMENT_LIST_LIMIT);

            return data.reverse().map(({ savedUserName, ...rest }) => ({
                ...rest,
                userName: rest.userName ?? savedUserName ?? "Unknown",
            }));
        }),
    create: protectedProcedure
        .input(commentInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const { content } = input;
            const { user } = ctx.auth;
            const [newComment] = await db
                .insert(comment)
                .values({
                    id: crypto.randomUUID(),
                    userId: user.id,
                    userName: user.name,
                    content,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning();
            return newComment;
        })
})

import { db } from "@/db";
import { game, team, user } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { eq, getTableColumns, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";

export const authRouter = createTRPCRouter({
    resetUserPassword: protectedProcedure
    .input(
          z.object({
            newPassword: z.string(),
            email: z.string(),
          })
        )
    .mutation(async ({ input }) => {
        const { newPassword, email } = input;
        
        //update the password of the user with the given email using betther auth ;
    }),
})
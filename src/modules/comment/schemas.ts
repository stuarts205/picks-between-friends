import { z } from "zod";

export const COMMENT_MAX_LENGTH = 500;

export const commentInsertSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Comment can't be empty" })
    .max(COMMENT_MAX_LENGTH, {
      message: `Comment must be ${COMMENT_MAX_LENGTH} characters or less`,
    }),
});

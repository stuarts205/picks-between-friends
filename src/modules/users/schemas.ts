import { z } from "zod";

export const usersInsertSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z
    .string()
    .min(8, { message: "Confirm Password must be at least 8 characters" }),
  emailVerified: z.boolean().optional(),
});

export const usersUpdateSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  overAllPoints: z.coerce.number().int(),
  weeklyPoints: z.coerce.number().int(),
});

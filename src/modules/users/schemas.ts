import { z } from 'zod';

export const usersInsertSchema = z.object({
    name: z.string().min(1, {message: "Name is required"}),
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters"}),
    confirmPassword: z.string().min(8, {message: "Confirm Password must be at least 8 characters"}),
    emailVerified: z.boolean().optional(),
})

export const usersUpdateSchema = usersInsertSchema
  .extend({
    id: z.string().min(1, { message: "ID is required" }),

    // 👇 override password fields to make them optional
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  // 👇 only validate if password is entered
  .refine((data) => !data.password || data.password.length >= 8, {
    path: ["password"],
    message: "Password must be at least 8 characters",
  })
  .refine(
    (data) =>
      !data.password ||
      (data.confirmPassword && data.confirmPassword.length >= 8),
    {
      path: ["confirmPassword"],
      message: "Confirm Password must be at least 8 characters",
    }
  )
  .refine(
    (data) =>
      !data.password || data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords must match",
    }
  );
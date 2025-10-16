import { z } from 'zod';

export const gamesInsertSchema = z.object({
    gameId: z.string().min(1, {message: "Game is required"}),
    week: z.coerce.number().min(1, { message: "Week is required" }),
    home: z.string().min(1, {message: "Home team is required"}),
    away: z.string().min(1, {message: "Away team is required"}),
    spread: z.string().min(1, {message: "Spread is required"}),
    home_id: z.string().optional(),
    away_id: z.string().optional(),
    favorite: z.string().min(1, {message: "Favorite team is required"}),
    league: z.string().min(1, {message: "League is required"}),
})

export const gamesInsertManySchema = z.array(gamesInsertSchema);

export const gamesUpdateSchema = gamesInsertSchema
  .extend({
    id: z.string().min(1, { message: "ID is required" }),
  });
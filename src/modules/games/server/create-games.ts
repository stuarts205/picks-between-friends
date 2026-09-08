import { db } from "@/db";
import { game, team } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import z from "zod";
import { gamesInsertManySchema } from "../schemas";

export type GameInput = z.infer<typeof gamesInsertManySchema>[number];

// Looks up each game's home/away teams and inserts a row per game.
// Shared by the manual "Load week X games" button and the automated
// load-next-week step that runs once a week's results are fully graded.
export async function createGames(input: GameInput[]) {
  const createdGames = [];
  for (const gameInput of input) {
    const isNFL = gameInput.league.toLowerCase().includes("nfl");

    const [homeTeam] = await db
      .select()
      .from(team)
      .where(
        and(
          eq(isNFL ? team.nickname : team.name, gameInput.home),
          eq(team.league, isNFL ? "NFL" : "College")
        )
      )
      .limit(1);

    const [awayTeam] = await db
      .select()
      .from(team)
      .where(
        and(
          eq(isNFL ? team.nickname : team.name, gameInput.away),
          eq(team.league, isNFL ? "NFL" : "College")
        )
      )
      .limit(1);

    if (!homeTeam || !awayTeam) {
      continue;
    }

    if (gameInput.spread === "0" || gameInput.spread === "") {
      continue;
    }

    const [createdGame] = await db
      .insert(game)
      .values({
        id: crypto.randomUUID(),
        week: gameInput.week,
        league: gameInput.league,
        home: isNFL ? homeTeam.nickname : homeTeam.name,
        away: isNFL ? awayTeam.nickname : awayTeam.name,
        spread: gameInput.spread || "0",
        homeId: homeTeam.id,
        awayId: awayTeam.id,
        favoriteSlug: gameInput.spread.includes("-")
          ? homeTeam.slug || ""
          : awayTeam.slug || "",
        favorite: gameInput.favorite,
        gameid: gameInput.gameId,
      })
      .returning();

    createdGames.push(createdGame);
  }
  return createdGames;
}

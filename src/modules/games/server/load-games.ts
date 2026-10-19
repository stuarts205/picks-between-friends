import { db } from "@/db";
import { game } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { getEventOdds, getGames, type SeasonLike } from "@/lib/utils";
import { createGames, type GameInput } from "./create-games";

type EspnTeam = {
  location?: string;
  name?: string;
  shortDisplayName: string;
};

// The team table stores college teams under their location ("Auburn") but
// NFL teams under their mascot name ("Chiefs") -- createGames looks games
// up the same way, so the name pulled from ESPN has to match per league.
function teamNameForLeague(team: EspnTeam | undefined, isNFL: boolean) {
  if (!team) return "";
  return (isNFL ? team.name : team.location) ?? team.shortDisplayName ?? "";
}

// Fetches the week's games from ESPN and inserts them, mirroring what the
// manual "Load week X games" button does. Called automatically once a
// week's results are fully graded, so the next week's games are ready
// without an admin having to click the button.
export async function loadGamesForSeason(season: SeasonLike) {
  const espnGames = await getGames(season);
  return createGamesFromEspn(espnGames, season);
}

// Re-fetches the week's games from ESPN and inserts only the ones that aren't
// already saved (matched on ESPN's game id), so games skipped on the first
// load -- e.g. because no odds were posted yet -- can be picked up later
// without duplicating the games that did load.
export async function loadMissingGamesForSeason(season: SeasonLike) {
  const espnGames = await getGames(season);
  const espnGameIds = espnGames.map((espnGame) => espnGame.competitions[0].id);
  if (espnGameIds.length === 0) return [];

  const existingGameIds = new Set(
    (
      await db
        .select({ gameId: game.gameid })
        .from(game)
        .where(inArray(game.gameid, espnGameIds))
    ).map((g) => g.gameId),
  );

  // The scoreboard is fetched a day at a time, so also guard against the
  // same event coming back more than once.
  const seen = new Set<string>();
  const missingGames = espnGames.filter((espnGame) => {
    const gameId = espnGame.competitions[0].id;
    if (existingGameIds.has(gameId) || seen.has(gameId)) return false;
    seen.add(gameId);
    return true;
  });

  return createGamesFromEspn(missingGames, season);
}

async function createGamesFromEspn(
  espnGames: Awaited<ReturnType<typeof getGames>>,
  season: SeasonLike,
) {
  const gameInputs: GameInput[] = await Promise.all(
    espnGames.map(async (espnGame) => {
      const gameId = espnGame.competitions[0].id;
      const isNFL = espnGame.league.toLowerCase().includes("nfl");
      const { spread, favorite } = await getEventOdds(
        gameId,
        espnGame.league,
      );

      return {
        gameId,
        week: season?.week || 1,
        league: espnGame.league,
        home: teamNameForLeague(
          espnGame.competitions[0].competitors[0]?.team,
          isNFL,
        ),
        away: teamNameForLeague(
          espnGame.competitions[0].competitors[1]?.team,
          isNFL,
        ),
        spread,
        favorite,
      };
    }),
  );

  return createGames(gameInputs);
}

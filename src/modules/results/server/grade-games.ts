import { db } from "@/db";
import { game, pick, season, user } from "@/db/schema";
import { eq, and, gte, isNull } from "drizzle-orm";
import { getGameScores } from "@/lib/utils";
import { loadGamesForSeason } from "@/modules/games/server/load-games";

export type GameToGrade = {
  id: string;
  gameId: string;
  league: string;
};

// Weeks run Tuesday-to-Monday, so the next week's start date is always
// exactly 7 days after the current one.
function addOneWeek(startDate: string): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + 7);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} 00:00:00.0000000`;
}

// Fetches one game's ESPN event and records its spread outcome once the event
// is final. Returns whether the game was final.
async function gradeGame(gameToGrade: GameToGrade) {
  const result = await getGameScores(
    gameToGrade.gameId,
    gameToGrade.league || "",
    gameToGrade.id
  );

  // Game isn't over yet (or ESPN has no spread outcome) -- leave it
  // ungraded rather than recording a false result.
  if (!result.isFinal) return false;

  await db
    .update(game)
    .set(
      result.push
        ? { push: true, winner: null, favoriteWin: null }
        : { winner: result.team?.team?.slug ?? null, favoriteWin: result.covered }
    )
    .where(eq(game.id, gameToGrade.id));

  return true;
}

// Fetches each game's ESPN event, updates the game's spread winner once the
// event is final, then re-grades every pick tied to that week's games.
// Shared by the manual "Get results" button and the scheduled cron check.
export async function gradeGames(games: GameToGrade[]) {
  let gradedCount = 0;

  for (const selectedGame of games) {
    if (!selectedGame.gameId) continue;
    if (await gradeGame(selectedGame)) gradedCount++;
  }

  const [currentWeek] = await db.select().from(season).limit(1);
  if (!currentWeek) return { gradedCount };

  // Set the winner on every game, not just the ones the admin selected for
  // picks, so grade the rest of the ungraded games too. The previous week is
  // included because the season advances as soon as the selected games finish,
  // which can be before the rest of that week's games.
  const handledIds = new Set(games.map((g) => g.id));
  const otherUngradedGames = (
    await db
      .select({ id: game.id, gameId: game.gameid, league: game.league })
      .from(game)
      .where(
        and(
          gte(game.week, currentWeek.week - 1),
          isNull(game.winner),
          isNull(game.push)
        )
      )
  ).filter((g): g is GameToGrade => !!g.gameId && !handledIds.has(g.id));

  // These games don't affect picks, so a failed ESPN fetch for one of them
  // must not stop the grading below.
  const otherResults = await Promise.allSettled(
    otherUngradedGames.map(gradeGame)
  );
  for (const outcome of otherResults) {
    if (outcome.status === "rejected") console.error(outcome.reason);
  }

  const picksForWeek = await db
    .select()
    .from(pick)
    .innerJoin(game, eq(pick.gameId, game.id))
    .where(eq(pick.week, currentWeek.week));

  for (const pickItem of picksForWeek) {
    // A push means nobody covered the spread -- every pick on that game
    // grades as a loss.
    if (pickItem.game.push) {
      await db
        .update(pick)
        .set({ win: false })
        .where(eq(pick.id, pickItem.pick.id));
      continue;
    }

    // Game hasn't been graded yet (not final, or no winner determined)
    // -- leave this pick ungraded instead of forcing a loss.
    if (!pickItem.game.winner) continue;

    await db
      .update(pick)
      .set({
        win: pickItem.pick.teamSlug === pickItem.game.winner,
      })
      .where(eq(pick.id, pickItem.pick.id));
  }

  // Recompute each user's total points (wins across every graded pick, all
  // weeks) and weekly points (wins for just the current week) now that
  // this week's picks may have changed.
  const allPicks = await db
    .select({ userId: pick.userId, win: pick.win, week: pick.week })
    .from(pick);

  const totalWinsByUser = new Map<string, number>();
  const weeklyWinsByUser = new Map<string, number>();
  for (const pickItem of allPicks) {
    if (pickItem.win !== true) continue;
    totalWinsByUser.set(
      pickItem.userId,
      (totalWinsByUser.get(pickItem.userId) ?? 0) + 1
    );
    if (pickItem.week === currentWeek.week) {
      weeklyWinsByUser.set(
        pickItem.userId,
        (weeklyWinsByUser.get(pickItem.userId) ?? 0) + 1
      );
    }
  }

  const allUsers = await db.select({ id: user.id }).from(user);
  for (const userItem of allUsers) {
    await db
      .update(user)
      .set({
        overAllPoints: totalWinsByUser.get(userItem.id) ?? 0,
        weeklyPoints: weeklyWinsByUser.get(userItem.id) ?? 0,
      })
      .where(eq(user.id, userItem.id));
  }

  // Once every selected game for this week is graded (a winner set, or a
  // push), advance the season to next week.
  const selectedGamesForWeek = await db
    .select({ winner: game.winner, push: game.push })
    .from(game)
    .where(and(eq(game.week, currentWeek.week), eq(game.selected, true)));

  const weekIsComplete =
    selectedGamesForWeek.length > 0 &&
    selectedGamesForWeek.every((g) => g.winner !== null || g.push === true);

  let advancedToWeek: number | null = null;
  let gamesLoadedForNextWeek: number | null = null;
  if (weekIsComplete) {
    advancedToWeek = currentWeek.week + 1;
    const nextStartDate = addOneWeek(currentWeek.startDate);

    await db
      .update(season)
      .set({
        week: advancedToWeek,
        startDate: nextStartDate,
      })
      .where(eq(season.id, currentWeek.id));

    const loadedGames = await loadGamesForSeason({
      ...currentWeek,
      week: advancedToWeek,
      startDate: nextStartDate,
    });
    gamesLoadedForNextWeek = loadedGames.length;
  }

  return { gradedCount, advancedToWeek, gamesLoadedForNextWeek };
}

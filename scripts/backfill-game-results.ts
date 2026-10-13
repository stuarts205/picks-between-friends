// One-off backfill: grades games that were never graded, using the same ESPN
// grading as the cron job (closing line + final score), so Team Records covers
// games from before the app was tracking them.
//
// It only writes to the game table (winner / push / favoriteWin) and the teams'
// running win/loss. It calls gradeGame directly instead of gradeGames, so picks,
// user points and the season week are never touched.
//
// Each ESPN game is graded at most once. The game table can hold the same
// gameid on several rows (a week that was loaded twice), and grading every copy
// would count that game's result for each team more than once. So a game is
// skipped entirely if any of its rows is already graded or has picks, and only
// one row is graded otherwise.
//
// Dry run (default):  npm run backfill:results
// Write the results:  npm run backfill:results -- --apply
import "dotenv/config";
import { asc, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { game, pick } from "@/db/schema";
import {
  gradeGame,
  type GameToGrade,
} from "@/modules/results/server/grade-games";

// Each game costs a few ESPN calls; keep the burst small.
const CONCURRENCY = 5;

type BackfillGame = GameToGrade & { week: number };

async function main() {
  const apply = process.argv.includes("--apply");

  const rows = await db
    .select({
      id: game.id,
      gameId: game.gameid,
      league: game.league,
      week: game.week,
      winner: game.winner,
      push: game.push,
    })
    .from(game)
    .where(isNotNull(game.gameid))
    .orderBy(asc(game.week), asc(game.id));

  const pickedGameIds = new Set(
    (await db.selectDistinct({ gameId: pick.gameId }).from(pick)).map(
      (p) => p.gameId,
    ),
  );

  const rowsByEspnId = new Map<string, typeof rows>();
  for (const row of rows) {
    const copies = rowsByEspnId.get(row.gameId!) ?? [];
    copies.push(row);
    rowsByEspnId.set(row.gameId!, copies);
  }

  const toGrade: BackfillGame[] = [];
  rowsByEspnId.forEach((copies, gameId) => {
    const handled = copies.some(
      (c) => c.winner !== null || c.push === true || pickedGameIds.has(c.id),
    );
    if (handled) return;
    const [first] = copies;
    toGrade.push({
      id: first.id,
      gameId,
      league: first.league,
      week: first.week,
    });
  });

  const ungradedRows = rows.filter((r) => r.winner === null && r.push === null);
  const byWeek = new Map<string, number>();
  for (const { league, week } of toGrade) {
    const key = `week ${week} ${league}`;
    byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
  }
  console.log(`${toGrade.length} games to grade:`);
  byWeek.forEach((count, key) => console.log(`  ${key}: ${count}`));
  console.log(
    `${ungradedRows.length - toGrade.length} other ungraded rows skipped ` +
      `(duplicate rows of a game, or a game that is already graded or has picks).`,
  );

  if (!apply) {
    console.log("\nDry run: nothing was written. Re-run with --apply to grade.");
    return;
  }

  let graded = 0;
  let notFinal = 0;
  let failed = 0;
  const queue = [...toGrade];

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        try {
          if (await gradeGame(next)) graded++;
          else notFinal++;
        } catch (error) {
          failed++;
          console.error(
            `Game ${next.gameId} (week ${next.week}, ${next.league}) failed:`,
            error,
          );
        }
      }
    }),
  );

  console.log(
    `\nDone: ${graded} graded, ${notFinal} not final yet (left ungraded), ${failed} failed.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

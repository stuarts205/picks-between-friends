// One-off cleanup: a week that was loaded twice leaves two game rows for the
// same ESPN gameid. Keeps one row per gameid and deletes the extras.
//
// The row kept is the one that matters most: has picks, then is graded, then is
// selected, then the lowest id. An extra is only deleted if it has no picks, is
// not graded and is not selected; anything else is left alone and reported.
//
// Dry run (default):  npm run dedupe:games
// Delete the extras:  npm run dedupe:games -- --apply
import "dotenv/config";
import { inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { game, pick } from "@/db/schema";

async function main() {
  const apply = process.argv.includes("--apply");

  const rows = await db
    .select({
      id: game.id,
      gameId: game.gameid,
      league: game.league,
      week: game.week,
      selected: game.selected,
      winner: game.winner,
      push: game.push,
    })
    .from(game)
    .where(isNotNull(game.gameid));

  const pickedGameIds = new Set(
    (await db.selectDistinct({ gameId: pick.gameId }).from(pick)).map(
      (p) => p.gameId,
    ),
  );

  const hasPicks = (r: (typeof rows)[number]) => pickedGameIds.has(r.id);
  const isGraded = (r: (typeof rows)[number]) =>
    r.winner !== null || r.push === true;
  const keepScore = (r: (typeof rows)[number]) =>
    (hasPicks(r) ? 4 : 0) + (isGraded(r) ? 2 : 0) + (r.selected === true ? 1 : 0);

  const rowsByEspnId = new Map<string, typeof rows>();
  for (const row of rows) {
    const copies = rowsByEspnId.get(row.gameId!) ?? [];
    copies.push(row);
    rowsByEspnId.set(row.gameId!, copies);
  }

  const toDelete: typeof rows = [];
  const unsafe: typeof rows = [];
  let duplicatedGames = 0;
  rowsByEspnId.forEach((copies) => {
    if (copies.length < 2) return;
    duplicatedGames++;
    const [, ...extras] = [...copies].sort(
      (a, b) => keepScore(b) - keepScore(a) || a.id.localeCompare(b.id),
    );
    for (const extra of extras) {
      const safe =
        !hasPicks(extra) && !isGraded(extra) && extra.selected !== true;
      (safe ? toDelete : unsafe).push(extra);
    }
  });

  const byWeek = new Map<string, number>();
  for (const { league, week } of toDelete) {
    const key = `week ${week} ${league}`;
    byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
  }
  console.log(
    `${duplicatedGames} games have more than one row; ${toDelete.length} extra rows can be deleted:`,
  );
  byWeek.forEach((count, key) => console.log(`  ${key}: ${count}`));
  if (unsafe.length) {
    console.log(
      `${unsafe.length} extra rows have picks, are graded or are selected, so they are being left alone:`,
    );
    unsafe.forEach((r) =>
      console.log(`  ${r.id} (gameid ${r.gameId}, week ${r.week} ${r.league})`),
    );
  }

  if (!apply) {
    console.log("\nDry run: nothing was deleted. Re-run with --apply to delete.");
    return;
  }

  const ids = toDelete.map((r) => r.id);
  for (let i = 0; i < ids.length; i += 100) {
    await db.delete(game).where(inArray(game.id, ids.slice(i, i + 100)));
  }
  console.log(`\nDeleted ${ids.length} duplicate game rows.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

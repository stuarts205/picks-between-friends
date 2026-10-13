// One-off reconcile: rebuilds each team's win/loss from the graded games in the
// game table, using the grader's rule (recordTeamResults): the team that covered
// the spread gets a win; the other team, or both teams on a push, get a loss.
//
// The grader only bumps team.win / team.loss the first time it grades a game, so
// games graded before that existed (or any later drift) leave the columns short.
// Only teams with at least one graded game are touched; the rest stay as they are.
//
// Dry run (default):  npm run recompute:team-records
// Write the records:  npm run recompute:team-records -- --apply
import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "@/db";

const derivedRecords = sql`
  with sides as (
    select home_id as team_id, winner, push from game
      where winner is not null or push is true
    union all
    select away_id, winner, push from game
      where winner is not null or push is true
  ), derived as (
    select s.team_id,
      count(*) filter (
        where s.push is not true and t.slug is not null and t.slug = s.winner
      )::int as wins,
      count(*) filter (
        where not (s.push is not true and t.slug is not null and t.slug = s.winner)
      )::int as losses
    from sides s join team t on t.id = s.team_id
    group by s.team_id
  )`;

type Change = {
  name: string;
  win: number | null;
  loss: number | null;
  wins: number;
  losses: number;
};

async function main() {
  const apply = process.argv.includes("--apply");

  const { rows: changes } = await db.execute<Change>(sql`${derivedRecords}
    select t.name, t.win, t.loss, d.wins, d.losses
    from derived d join team t on t.id = d.team_id
    where t.win is distinct from d.wins or t.loss is distinct from d.losses
    order by t.name`);

  const lowered = changes.filter(
    (c) => (c.win ?? 0) > c.wins || (c.loss ?? 0) > c.losses,
  );
  const addedWins = changes.reduce((n, c) => n + c.wins - (c.win ?? 0), 0);
  const addedLosses = changes.reduce((n, c) => n + c.losses - (c.loss ?? 0), 0);

  console.log(
    `${changes.length} teams to update (net ${addedWins >= 0 ? "+" : ""}${addedWins} wins, ` +
      `${addedLosses >= 0 ? "+" : ""}${addedLosses} losses).`,
  );
  if (lowered.length) {
    console.log(
      `${lowered.length} of those would go DOWN, which the grader should never cause:`,
    );
    console.table(lowered);
  }
  console.table(changes.slice(0, 10));
  if (changes.length > 10) console.log(`  ...and ${changes.length - 10} more`);

  if (!apply) {
    console.log("\nDry run: nothing was written. Re-run with --apply to update.");
    return;
  }

  await db.execute(sql`${derivedRecords}
    update team t set win = d.wins, loss = d.losses
    from derived d
    where t.id = d.team_id
      and (t.win is distinct from d.wins or t.loss is distinct from d.losses)`);
  console.log(`\nUpdated ${changes.length} teams.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

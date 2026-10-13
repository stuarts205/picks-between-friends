// One-off: marks which college teams are Division I by filling team.division
// with "FBS" or "FCS". ESPN's teams list can't be filtered by division, so this
// reads group membership from its core API (FBS is group 80, FCS is group 81),
// then matches each team by the ESPN id in its logo URL
// (.../teamlogos/ncaa/500/<id>.png). Teams ESPN doesn't list are left null.
//
// Dry run (default):  npm run set:team-divisions
// Write the divisions: npm run set:team-divisions -- --apply
import "dotenv/config";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { team } from "@/db/schema";

const CORE_GROUPS =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons/2026/types/2/groups";

const DIVISIONS = [
  { division: "FBS", groupId: 80 },
  { division: "FCS", groupId: 81 },
] as const;

type Division = (typeof DIVISIONS)[number]["division"];
type EspnList = { items: { $ref: string }[] };

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url.replace("http://", "https://"));
  if (!response.ok) throw new Error(`ESPN ${response.status}: ${url}`);
  return response.json() as Promise<T>;
}

// ESPN team id -> division, for every team in every conference of the group.
async function getDivisionByEspnId() {
  const divisionByEspnId = new Map<string, Division>();

  for (const { division, groupId } of DIVISIONS) {
    const conferences = await getJson<EspnList>(
      `${CORE_GROUPS}/${groupId}/children?limit=100`,
    );
    for (const conferenceRef of conferences.items) {
      const { id } = await getJson<{ id: string }>(conferenceRef.$ref);
      const teams = await getJson<EspnList>(
        `${CORE_GROUPS}/${id}/teams?limit=200`,
      );
      for (const { $ref } of teams.items) {
        const espnId = $ref.match(/\/teams\/(\d+)/)?.[1];
        if (espnId) divisionByEspnId.set(espnId, division);
      }
    }
  }
  return divisionByEspnId;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const divisionByEspnId = await getDivisionByEspnId();
  const espnCounts = { FBS: 0, FCS: 0 };
  divisionByEspnId.forEach((division) => espnCounts[division]++);
  console.log(
    `ESPN lists ${espnCounts.FBS} FBS and ${espnCounts.FCS} FCS teams.`,
  );

  const collegeTeams = await db
    .select({ id: team.id, name: team.name, logo: team.logo })
    .from(team)
    .where(eq(team.league, "College"));

  const idsByDivision: Record<Division, string[]> = { FBS: [], FCS: [] };
  const matchedEspnIds = new Set<string>();
  const noEspnId: string[] = [];
  for (const t of collegeTeams) {
    const espnId = t.logo?.match(/teamlogos\/ncaa\/\d+\/(\d+)\.png/)?.[1];
    if (!espnId) {
      noEspnId.push(t.name);
      continue;
    }
    const division = divisionByEspnId.get(espnId);
    if (!division) continue;
    idsByDivision[division].push(t.id);
    matchedEspnIds.add(espnId);
  }

  console.log(
    `Matched ${idsByDivision.FBS.length} FBS and ${idsByDivision.FCS.length} FCS ` +
      `of ${collegeTeams.length} college teams; ` +
      `${collegeTeams.length - idsByDivision.FBS.length - idsByDivision.FCS.length} stay null.`,
  );

  const unmatched = [...divisionByEspnId.keys()].filter(
    (id) => !matchedEspnIds.has(id),
  );
  console.log(
    `ESPN Division I teams with no match in the team table: ${unmatched.length}` +
      (unmatched.length ? ` (ESPN ids ${unmatched.join(", ")})` : ""),
  );
  if (noEspnId.length) {
    console.log(
      `${noEspnId.length} teams have no ESPN id in their logo URL: ${noEspnId.join(", ")}`,
    );
  }

  if (!apply) {
    console.log("\nDry run: nothing was written. Re-run with --apply to update.");
    return;
  }

  for (const { division } of DIVISIONS) {
    const ids = idsByDivision[division];
    for (let i = 0; i < ids.length; i += 100) {
      await db
        .update(team)
        .set({ division })
        .where(
          and(eq(team.league, "College"), inArray(team.id, ids.slice(i, i + 100))),
        );
    }
  }
  console.log(
    `\nSet division on ${idsByDivision.FBS.length + idsByDivision.FCS.length} teams.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

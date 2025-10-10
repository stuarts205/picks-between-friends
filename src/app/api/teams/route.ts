import { NextResponse, NextRequest } from "next/server";
import { getCollegeTeams, getNflTeams } from "@/lib/utils";
import { db } from "@/db";
import { team } from "@/db/schema";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const collegeTeams = await getCollegeTeams();

    const insertData = collegeTeams.sports[0].leagues[0].teams.map((t: any) => {
      let newLogo = "";
      if (t.team.logos && t.team.logos.length > 0) {
        newLogo = t.team.logos[0].href;
      }

      return {
        name: t.team.location ?? null,
        nickname: t.team.name ?? null,
        abbreviation: t.team.abbreviation ?? null,
        conference: null, 
        logo: newLogo ?? null,
        league: "College",
      };
    });

    await db.insert(team).values(insertData);

    const nflTeams = await getNflTeams();

    const insertNflData = nflTeams.sports[0].leagues[0].teams.map((t: any) => {
        let newLogo = "";
        if (t.team.logos && t.team.logos.length > 0) {
            newLogo = t.team.logos[0].href;
        }

        return {
            name: t.team.location ?? null,
            nickname: t.team.name ?? null,
            abbreviation: t.team.abbreviation ?? null,
            conference: t.team.conference ?? null,
            logo: newLogo ?? null,
            league: "NFL",
        }
    })

    await db.insert(team).values(insertNflData);

    return NextResponse.json(collegeTeams, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: `Something went wrong: ${error}` },
      { status: 500 }
    );
  }
}

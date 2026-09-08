import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { game, season } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { gradeGames, type GameToGrade } from "@/modules/results/server/grade-games";

// Scheduled by vercel.json to poll periodically. Vercel signs requests with
// this header using CRON_SECRET so the endpoint can't be triggered by anyone
// else. See https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentWeek] = await db.select().from(season).limit(1);
  if (!currentWeek) {
    return NextResponse.json({ message: "No active season found" });
  }

  const ungradedSelectedGames = await db
    .select({
      id: game.id,
      gameId: game.gameid,
      league: game.league,
    })
    .from(game)
    .where(
      and(
        eq(game.week, currentWeek.week),
        eq(game.selected, true),
        isNull(game.winner),
        isNull(game.push)
      )
    );

  const toGrade = ungradedSelectedGames.filter(
    (g): g is GameToGrade => !!g.gameId
  );

  const { gradedCount, advancedToWeek, gamesLoadedForNextWeek } =
    await gradeGames(toGrade);

  return NextResponse.json({
    week: currentWeek.week,
    checked: toGrade.length,
    graded: gradedCount,
    advancedToWeek,
    gamesLoadedForNextWeek,
  });
}

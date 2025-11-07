import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.url ? new URL(req.url) : { searchParams: null };
  const gameId = searchParams?.get("gameId");

  if (!gameId) {
    return NextResponse.json({ error: "gameId is required" }, { status: 400 });
  }

  const response = await fetch(`http://site.api.espn.com/apis/site/v2/sports/football/college-football/summary?event=${gameId}`);
  const data = await response.json();
  const status = data?.header?.competitions[0]?.status?.type?.name;
  return NextResponse.json(status, { status: 200 });
}

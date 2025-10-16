import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.url ? new URL(req.url) : { searchParams: null };
  const gameId = searchParams?.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
  }

  const url = `http://site.api.espn.com/apis/site/v2/sports/football/college-football/summary?event=${gameId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch ESPN API');

    const data = await response.json();

    const status = data?.header?.competitions[0].status?.type?.name;
    const startTime = data?.header?.competitions[0].status?.type?.shortDetail;

    return NextResponse.json({ status, startTime });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

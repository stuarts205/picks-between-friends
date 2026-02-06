import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const powerFiveId = ["8", "1", "18", "4", "9", "5"];

export function getGameStatus(gameId: string, league: string) {
  return fetch(
    `https://site.api.espn.com/apis/site/v2/sports/football/${league}/summary?event=${gameId}`
  )
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch ESPN API");
      return response.json();
    })
    .then((data) => {
      const status = data?.header?.competitions[0]?.status?.type?.name;
      return status;
    });
}

export function getGameScores(gameId: string, league: string, id: string) {
  return fetch(
    `https://site.api.espn.com/apis/site/v2/sports/football/${league}/summary?event=${gameId}`
  )
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch ESPN API");
      return response.json();
    })
    .then(async (data) => {
      const pickcenter = data.pickcenter?.[0];
      if (!pickcenter) return { covered: null, reason: "No pickcenter data" };
      const favoriteTeamId = pickcenter.homeTeamOdds.favorite
        ? pickcenter.homeTeamOdds.teamId
        : pickcenter.awayTeamOdds.teamId;

      let coveringTeamId: string | null = null;

      if (pickcenter.pointSpread?.home?.close?.outcome === "WIN") {
        coveringTeamId = pickcenter.homeTeamOdds.teamId;
      } else if (pickcenter.pointSpread?.away?.close?.outcome === "WIN") {
        coveringTeamId = pickcenter.awayTeamOdds.teamId;
      }

      const covered =
        pickcenter.homeTeamOdds.favorite &&
        pickcenter.pointSpread?.home?.close?.outcome === "WIN"
          ? true
          : pickcenter.awayTeamOdds.favorite &&
            pickcenter.pointSpread?.away?.close?.outcome === "WIN"
          ? true
          : false;

      const team = await getTeamById(coveringTeamId, league);

      return {
        id,
        team,
        gameId,
        favoriteTeamId,
        coveringTeamId,
        spread: pickcenter.spread,
        covered,
      };
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTeamById(coveringTeamId: string | null, league: any) {
  if (!coveringTeamId) return null;
  const repsonse = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/football/${league}/teams/${coveringTeamId}`
  );
  return await repsonse.json();
}

export const getCollegeTeams = async () => {
  const repsonse = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams?limit=5000"
  );
  return await repsonse.json();
};

export const getNflTeams = async () => {
  const repsonse = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams"
  );
  return await repsonse.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGames = async (season: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let collegeGames: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nflGames: any[] = [];

  const dateList = generateDateSeries(season?.startDate, 7);

  for (const date of dateList) {
    const collegeResponse = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${date}`
    );

    if (collegeResponse.ok) {
      const collegeData = await collegeResponse.json();

      const leagueName = collegeData.leagues[0]?.slug ?? "college-football";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gamesWithLeague = collegeData.events.map((game: any) => ({
        ...game,
        league: leagueName,
      }));

      const filteredGames = [...collegeGames, ...gamesWithLeague].filter(
        (game) =>
          powerFiveId.includes(
            game.competitions[0].competitors[0].team.conferenceId ||
              game.competitions[0].competitors[1].team.conferenceId
          )
      );

      collegeGames = filteredGames;
    }
  }

  for (const date of dateList) {
    const nflResponse = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${date}`
    );

    if (nflResponse.ok) {
      const nflData = await nflResponse.json();

      const leagueName = nflData.leagues[0]?.slug ?? "nfl";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gamesWithLeague = nflData.events.map((game: any) => ({
        ...game,
        league: leagueName,
      }));

      nflGames = [...nflGames, ...gamesWithLeague];
    }
  }

  const allGames = [...collegeGames, ...nflGames];

  return allGames;
};

function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function generateDateSeries(startDateStr: string, days: number): string[] {
  const startDate = new Date(startDateStr.replace(" ", "T"));
  const results: string[] = [];

  for (let i = 0; i < days; i++) {
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + i);
    results.push(formatDateYYYYMMDD(nextDate));
  }

  return results;
}

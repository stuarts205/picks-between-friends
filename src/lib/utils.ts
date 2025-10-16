import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export let powerFiveId = ["8", "1", "18", "4", "9", "5"];

export const getCollegeTeams = async () => {
  const repsonse = await fetch(
    "http://site.api.espn.com/apis/site/v2/sports/football/college-football/teams?limit=5000"
  );
  return await repsonse.json();
};

export const getNflTeams = async () => {
  const repsonse = await fetch(
    "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams"
  );
  return await repsonse.json();
};

export const getGames = async (season: any) => {
  let collegeGames: any[] = [];
  let nflGames: any[] = [];

  const dateList = generateDateSeries(season?.startDate, 7);

  for (const date of dateList) {
    const collegeResponse = await fetch(
      `http://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${date}`
    );

    if (collegeResponse.ok) {
      const collegeData = await collegeResponse.json();

      const leagueName = collegeData.leagues[0]?.slug ?? "college-football";

      const gamesWithLeague = collegeData.events.map((game: any) => ({
        ...game,
        league: leagueName,
      }));

      const filteredGames = [...collegeGames, ...gamesWithLeague].filter((game) =>
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
      `http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${date}`
    );

    if (nflResponse.ok) {
      const nflData = await nflResponse.json();

      const leagueName = nflData.leagues[0]?.slug ?? "nfl";

      const gamesWithLeague = nflData.events.map((game: any) => ({
        ...game,
        league: leagueName,
      }));

      nflGames = [...nflGames, ...gamesWithLeague];
    }
  }

  const allGames = [...collegeGames, ...nflGames];

  console.log("allGames", allGames);

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

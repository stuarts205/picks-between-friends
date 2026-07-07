import { SeasonGetOne } from "@/modules/season/type";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const powerFiveId = ["8", "1", "18", "4", "9", "5"];

export const leagueMap = ["college-football", "nfl"];

type EspnCompetitor = {
  team: {
    shortDisplayName: string;
    conferenceId?: string;
  };
};

type EspnOdds = {
  spread?: number;
  details?: string;
};

type EspnCompetition = {
  id: string;
  competitors: EspnCompetitor[];
  odds?: EspnOdds[];
};

type EspnGame = {
  competitions: EspnCompetition[];
  league: string;
};

export function getGameStatus(gameId: string, league: string) {
  return fetch(
    `https://site.api.espn.com/apis/site/v2/sports/football/${league}/summary?event=${gameId}`,
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
    `https://site.api.espn.com/apis/site/v2/sports/football/${league}/summary?event=${gameId}`,
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

export async function getTeamById(
  coveringTeamId: string | null,
  league: string,
) {
  if (!coveringTeamId) return null;
  const repsonse = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/football/${league}/teams/${coveringTeamId}`,
  );
  return await repsonse.json();
}

export const getCollegeTeams = async () => {
  const repsonse = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams?limit=5000",
  );
  return await repsonse.json();
};

export const getNflTeams = async () => {
  const repsonse = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams",
  );
  return await repsonse.json();
};

export const getGames = async (season: SeasonGetOne) => {
  let collegeGames: EspnGame[] = [];
  let nflGames: EspnGame[] = [];

  const startDate = formatDateYYYYMMDD(
    new Date(String(season?.startDate).replace(" ", "T")),
  );
  const endDateDate = new Date(season?.startDate);
  endDateDate.setDate(endDateDate.getDate() + 7);
  const endDate = formatDateYYYYMMDD(endDateDate);

  for (const league of leagueMap) {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/${league}/scoreboard?dates=${startDate}-${endDate}`,
    );
    const data = await response.json();
    if (response.ok) {
      const gamesWithLeague = data.events.map(
        (game: Omit<EspnGame, "league">) => ({
          ...game,
          league: league,
        }),
      );
      if (league === "college-football") {
        const filteredGames = [...collegeGames, ...gamesWithLeague].filter(
          (game) =>
            powerFiveId.includes(
              game.competitions[0].competitors[0].team.conferenceId ||
                game.competitions[0].competitors[1].team.conferenceId ||
                "",
            ),
        );
        collegeGames = filteredGames;
      } else if (league === "nfl") {
        nflGames = [...nflGames, ...gamesWithLeague];
      }
    }
  }

  return [...collegeGames, ...nflGames];
};

function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

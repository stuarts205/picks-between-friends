import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Deliberately not SeasonGetOne (inferred from AppRouter): this file is
// imported from inside router procedure definitions, and depending on a
// router-inferred type here would make those routers' types depend on
// themselves through AppRouter.
export type SeasonLike = {
  week?: number | null;
  startDate: string;
};

export const powerFiveId = ["8", "1", "18", "4", "9", "5"];

export const leagueMap = ["college-football", "nfl"];

type EspnCompetitor = {
  team: {
    location?: string;
    name?: string;
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

export type GameScoreResult =
  | {
      id: string;
      gameId: string;
      status?: string;
      isFinal: false;
      reason?: string;
    }
  | {
      id: string;
      gameId: string;
      status?: string;
      isFinal: true;
      push: true;
    }
  | {
      id: string;
      gameId: string;
      status?: string;
      isFinal: true;
      push: false;
      team: Awaited<ReturnType<typeof getTeamById>>;
      favoriteTeamId: string;
      coveringTeamId: string;
      spread: number;
      covered: boolean;
    };

export function getGameScores(
  gameId: string,
  league: string,
  id: string,
): Promise<GameScoreResult> {
  return fetch(
    `https://site.api.espn.com/apis/site/v2/sports/football/${league}/summary?event=${gameId}`,
  )
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch ESPN API");
      return response.json();
    })
    .then(async (data) => {
      const competition = data?.header?.competitions?.[0];
      const status = competition?.status?.type?.name as string | undefined;

      // Only grade picks once ESPN has marked the event as finished --
      // scores/lines aren't settled before then, which would otherwise be
      // misread as "did not cover" (a false loss).
      if (status !== "STATUS_FINAL") {
        return { id, gameId, status, isFinal: false };
      }

      const pickcenter = data.pickcenter?.[0];
      const homeCompetitor = competition?.competitors?.find(
        (c: { homeAway?: string }) => c.homeAway === "home",
      );
      const awayCompetitor = competition?.competitors?.find(
        (c: { homeAway?: string }) => c.homeAway === "away",
      );

      if (!pickcenter || !homeCompetitor || !awayCompetitor) {
        return {
          id,
          gameId,
          status,
          isFinal: false,
          reason: "No pickcenter or score data",
        };
      }

      // ESPN's pickcenter no longer exposes a "who covered" outcome field,
      // so the cover has to be derived from the closing home line plus the
      // final score: adjust the home score by its line and compare.
      const homeLine = Number(pickcenter.pointSpread?.home?.close?.line);
      const homeScore = Number(homeCompetitor.score);
      const awayScore = Number(awayCompetitor.score);

      if (
        Number.isNaN(homeLine) ||
        Number.isNaN(homeScore) ||
        Number.isNaN(awayScore)
      ) {
        return {
          id,
          gameId,
          status,
          isFinal: false,
          reason: "Missing spread line or final score",
        };
      }

      const adjustedHomeScore = homeScore + homeLine;

      let coveringTeamId: string | null = null;
      if (adjustedHomeScore > awayScore) {
        coveringTeamId = pickcenter.homeTeamOdds.teamId;
      } else if (adjustedHomeScore < awayScore) {
        coveringTeamId = pickcenter.awayTeamOdds.teamId;
      }

      // Push (adjusted score ties the line exactly) -- nobody covers.
      // Every pick on this game grades as a loss.
      if (!coveringTeamId) {
        return { id, gameId, status, isFinal: true, push: true };
      }

      const favoriteTeamId = pickcenter.homeTeamOdds.favorite
        ? pickcenter.homeTeamOdds.teamId
        : pickcenter.awayTeamOdds.teamId;

      const covered = coveringTeamId === favoriteTeamId;

      const team = await getTeamById(coveringTeamId, league);

      return {
        id,
        gameId,
        status,
        isFinal: true,
        push: false,
        team,
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

// ESPN's scoreboard endpoint no longer includes odds on each event, so
// spread/favorite have to be pulled per-game from the summary endpoint's
// pickcenter data instead -- this works for scheduled games too, not just
// finished ones.
export async function getEventOdds(
  gameId: string,
  league: string,
): Promise<{ spread: string; favorite: string }> {
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/${league}/summary?event=${gameId}`,
    );
    if (!response.ok) return { spread: "0", favorite: "N/A" };

    const data = await response.json();
    const pickcenter = data.pickcenter?.[0];
    if (!pickcenter) return { spread: "0", favorite: "N/A" };

    return {
      spread:
        typeof pickcenter.spread === "number"
          ? pickcenter.spread.toString()
          : "0",
      favorite:
        typeof pickcenter.details === "string"
          ? pickcenter.details.split(" ")[0]
          : "N/A",
    };
  } catch {
    return { spread: "0", favorite: "N/A" };
  }
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

// ESPN's scoreboard rejects `start-end` date ranges with a 400 but accepts a
// single day, so a week is fetched one day at a time. Throws on a bad response
// so a failed fetch isn't mistaken for "no games this week".
async function getScoreboardEvents(league: string, date: string) {
  const response = await fetch(
    `https://site.web.api.espn.com/apis/site/v2/sports/football/${league}/scoreboard?dates=${date}`,
  );
  if (!response.ok) {
    throw new Error(
      `ESPN ${league} scoreboard for ${date} failed: ${response.status}`,
    );
  }
  const data = await response.json();
  return (data.events ?? []) as Omit<EspnGame, "league">[];
}

export const getGames = async (season: SeasonLike) => {
  let collegeGames: EspnGame[] = [];
  let nflGames: EspnGame[] = [];

  // A week is the start date plus the six days after it (Tuesday-Monday).
  const weekStart = new Date(String(season?.startDate).replace(" ", "T"));
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return formatDateYYYYMMDD(day);
  });

  for (const league of leagueMap) {
    const eventsByDay = await Promise.all(
      weekDates.map((date) => getScoreboardEvents(league, date)),
    );
    const gamesWithLeague = eventsByDay
      .flat()
      .map((game) => ({ ...game, league: league }));

    if (league === "college-football") {
      const filteredGames = [...collegeGames, ...gamesWithLeague].filter(
        (game) => {
          const homeConferenceId =
            game.competitions[0].competitors[0]?.team.conferenceId;
          const awayConferenceId =
            game.competitions[0].competitors[1]?.team.conferenceId;

          return (
            powerFiveId.includes(String(homeConferenceId ?? "")) ||
            powerFiveId.includes(String(awayConferenceId ?? ""))
          );
        },
      );
      collegeGames = filteredGames;
    } else if (league === "nfl") {
      nflGames = [...nflGames, ...gamesWithLeague];
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

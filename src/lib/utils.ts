import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

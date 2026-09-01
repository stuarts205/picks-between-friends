import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type PicksGetMany =
  inferRouterOutputs<AppRouter>["analytics"]["getManyForOverall"];

export type AnalyticsCompetitor = {
  id: string;
  name: string;
  record: string;
  winPercentage: number;
  bestWeek: {
    week: number;
    record: string;
  } | null;
};

export const mockAnalyticsCompetitors: AnalyticsCompetitor[] = [
  {
    id: "user-1",
    name: "Alex Morgan",
    record: "42-18",
    winPercentage: 70,
    bestWeek: { week: 4, record: "8-2" },
  },
  {
    id: "user-2",
    name: "Jordan Lee",
    record: "38-22",
    winPercentage: 63.3,
    bestWeek: { week: 7, record: "7-3" },
  },
  {
    id: "user-3",
    name: "Casey Rivera",
    record: "35-25",
    winPercentage: 58.3,
    bestWeek: { week: 2, record: "6-4" },
  },
  {
    id: "user-4",
    name: "Taylor Brooks",
    record: "31-29",
    winPercentage: 51.7,
    bestWeek: { week: 6, record: "6-4" },
  },
  {
    id: "user-5",
    name: "Morgan Davis",
    record: "27-33",
    winPercentage: 45,
    bestWeek: { week: 5, record: "5-5" },
  },
];

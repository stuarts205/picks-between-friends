"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockAnalyticsCompetitors } from "@/modules/analytics/type";
import { SeasonGetOne } from "@/modules/season/type";
// import { useTRPC } from "@/trpc/client";
// import { useSuspenseQuery } from "@tanstack/react-query";

interface AnalyticsViewProps {
  currentSeason: SeasonGetOne;
}

export const AnalyticsView = ({ currentSeason }: AnalyticsViewProps) => {
  // const trpc = useTRPC();

  // const { data: overall } = useSuspenseQuery(
  //   trpc.analytics.getManyForOverall.queryOptions(),
  // );

  // const competitors = Array.from(
  //   new Map(
  //     overall.items.map((pick) => [
  //       pick.userId,
  //       { id: pick.userId, name: pick.userName ?? "Unknown user" },
  //     ]),
  //   ).values(),
  // );

  // const data: AnalyticsCompetitor[] = competitors.map((competitor) => {
  //   const competitorPicks = overall.items.filter(
  //     (pick) => pick.userId === competitor.id,
  //   );
  //   const totalWins = competitorPicks.filter(
  //     (pick) => pick.win === true,
  //   ).length;
  //   const totalLosses = competitorPicks.filter(
  //     (pick) => pick.win === false,
  //   ).length;
  //   const decidedPicks = totalWins + totalLosses;
  //   const weeklyRecords = new Map<number, { wins: number; losses: number }>();

  //   competitorPicks.forEach((pick) => {
  //     if (pick.win === null) return;

  //     const weeklyRecord = weeklyRecords.get(pick.week) ?? {
  //       wins: 0,
  //       losses: 0,
  //     };

  //     if (pick.win) {
  //       weeklyRecord.wins += 1;
  //     } else {
  //       weeklyRecord.losses += 1;
  //     }

  //     weeklyRecords.set(pick.week, weeklyRecord);
  //   });

  //   const bestWeek = Array.from(weeklyRecords.entries()).reduce<{
  //     week: number;
  //     wins: number;
  //     losses: number;
  //   } | null>((best, [week, record]) => {
  //     if (!best || record.wins > best.wins) {
  //       return { week, ...record };
  //     }

  //     return best;
  //   }, null);

  //   return {
  //     ...competitor,
  //     record: `${totalWins}-${totalLosses}`,
  //     winPercentage: decidedPicks ? (totalWins / decidedPicks) * 100 : 0,
  //     bestWeek: bestWeek && {
  //       week: bestWeek.week,
  //       record: `${bestWeek.wins}-${bestWeek.losses}`,
  //     },
  //   };
  // });
  const data = mockAnalyticsCompetitors;

  return (
    <div className="p-4">
      <section className="w-full">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Win %</TableHead>
                <TableHead>Best Week</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length ? (
                data.map((competitor) => (
                  <TableRow key={competitor.id}>
                    <TableCell>{competitor.name}</TableCell>
                    <TableCell>{competitor.record}</TableCell>
                    <TableCell>
                      {competitor.winPercentage.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {competitor.bestWeek
                        ? `Week ${competitor.bestWeek.week}: ${competitor.bestWeek.record}`
                        : "No results"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    No competitors have made picks yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export const AnalyticsViewLoading = () => (
  <LoadingState
    title="Loading games"
    description="Please wait while we fetch the game list."
  />
);

export const AnalyticsViewError = () => (
  <ErrorState
    title="Error loading games"
    description="There was an error fetching the game list. Please try again."
  />
);

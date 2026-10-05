import {
  AnalyticsView,
  AnalyticsViewError,
  AnalyticsViewLoading,
} from "@/modules/analytics/ui/views/analytics-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { season } from "@/db/schema";
import { db } from "@/db";
import { getQueryClient, trpc } from "@/trpc/server";
import { SeasonGetOne } from "@/modules/season/type";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  const currentSeason = (
    await db.select().from(season).limit(1)
  )[0] as SeasonGetOne;
  void queryClient.prefetchQuery(
    trpc.analytics.getManyForOverall.queryOptions(),
  );
  void queryClient.prefetchQuery(
    trpc.analytics.getWeeklyPointsForUser.queryOptions(),
  );
  void queryClient.prefetchQuery(
    trpc.analytics.getPicksByWeekByUser.queryOptions(),
  );
  void queryClient.prefetchQuery(trpc.analytics.getSelectedTeams.queryOptions());
  void queryClient.prefetchQuery(trpc.analytics.getPlayers.queryOptions());
  void queryClient.prefetchQuery(trpc.analytics.getTeamRecords.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AnalyticsViewLoading />}>
        <ErrorBoundary fallback={<AnalyticsViewError />}>
          <AnalyticsView currentSeason={currentSeason} user={session?.user} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

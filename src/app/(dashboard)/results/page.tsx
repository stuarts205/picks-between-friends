import { db } from "@/db";
import { season } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ResultsView, ResultsViewError, ResultsViewLoading } from "@/modules/results/ui/views/results-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  const currentSeason = (await db.select().from(season).limit(1))[0];
  void queryClient.prefetchQuery(
    trpc.results.getManyWeeklySelectedGames.queryOptions({
      week: currentSeason?.week,
    })
  );
  void queryClient.prefetchQuery(
    trpc.results.getUpdatedResults.queryOptions()
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ResultsViewLoading />}>
        <ErrorBoundary fallback={<ResultsViewError />}>
          <ResultsView week={currentSeason?.week} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

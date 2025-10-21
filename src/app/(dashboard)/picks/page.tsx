import { db } from "@/db";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { season } from "@/db/schema";
import {
  PicksView,
  PicksViewError,
  PicksViewLoading,
} from "@/modules/picks/ui/views/picks-view";
import { PicksListHeader } from "@/modules/picks/ui/components/picks-list-header";

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
    trpc.picks.getManySelected.queryOptions({
      week: currentSeason?.week,
      league: "college-football",
      selected: true,
    })
  );
  void queryClient.prefetchQuery(
    trpc.picks.getManySelected.queryOptions({
      week: currentSeason?.week,
      league: "nfl",
      selected: true,
    })
  );

  return (
    <>
      <PicksListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<PicksViewLoading />}>
          <ErrorBoundary fallback={<PicksViewError />}>
            <PicksView session={session} currentSeason={currentSeason} />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;

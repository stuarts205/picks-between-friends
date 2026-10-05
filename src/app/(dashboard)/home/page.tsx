import { db } from "@/db";
import { season, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { HomeView, HomeViewError, HomeViewLoading } from "@/modules/home/ui/views/home-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { eq } from "drizzle-orm";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  const currentSeason = (await db.select().from(season).limit(1))[0];
  const currentUser = (
    await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  )[0];
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
  void queryClient.prefetchQuery(trpc.analytics.getWeeklyPointsForUser.queryOptions());
  void queryClient.prefetchQuery(trpc.users.getOverallStandings.queryOptions());
  void queryClient.prefetchQuery(trpc.users.getWeeklyStandings.queryOptions({ week: currentSeason.week }));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<HomeViewLoading />}>
        <ErrorBoundary fallback={<HomeViewError />}>
          <HomeView
            session={session}
            user={
              currentUser
                ? {
                    ...currentUser,
                    createdAt: currentUser.createdAt.toISOString(),
                    updatedAt: currentUser.updatedAt.toISOString(),
                  }
                : currentUser
            }
            currentSeason={currentSeason}
          />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

import { db } from "@/db";
import { season, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { eq, and, getTableColumns } from "drizzle-orm";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }  

  const queryClient = getQueryClient();
  const currentSeason = (await db.select().from(season).limit(1))[0];
  const currentUser = (await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  )[0];
  void queryClient.prefetchQuery(
      trpc.home.getManyPicks.queryOptions({
        week: currentSeason?.week,
        league: "college-football",
        session
      })
    );
    void queryClient.prefetchQuery(
      trpc.home.getManyPicks.queryOptions({
        week: currentSeason?.week,
        league: "nfl",
        session
      })
    );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Error loading home view.</div>}>
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

import { auth } from "@/lib/auth";
import { GamesListHeader } from "@/modules/games/ui/components/games-list-header";
import {
  GamesView,
  GamesViewError,
  GamesViewLoading,
} from "@/modules/games/ui/views/games-view";
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
  void queryClient.prefetchQuery(trpc.games.getMany.queryOptions({}));

  return (
    <>
      <GamesListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<GamesViewLoading />}>
          <ErrorBoundary fallback={<GamesViewError />}>
            <GamesView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;

import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/users/params";
import { ResetYear } from "@/modules/users/ui/components/reset-year";
import UsersListHeader from "@/modules/users/ui/components/users-list-header";
import UsersView, {
  UsersViewError,
  UsersViewLoading,
} from "@/modules/users/ui/views/users-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.users.getMany.queryOptions({ ...filters }),
  );

  return (
    <div className="">
      <div className="mx-4 md:mx-8 mb-4 rounded-lg border mt-4">
        <UsersListHeader />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<UsersViewLoading />}>
            <ErrorBoundary fallback={<UsersViewError />}>
              <UsersView />
            </ErrorBoundary>
          </Suspense>
        </HydrationBoundary>
      </div>
      <div className="mx-4 md:mx-8 mb-4 rounded-lg border mt-4">
        <ResetYear />
      </div>
    </div>
  );
};

export default Page;

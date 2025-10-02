import { UserIdView, UserIdViewError, UserIdViewLoading } from "@/modules/users/ui/views/user-id-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{ userId: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { userId } = await params;
  const queryClient = getQueryClient();
  
  void queryClient.prefetchQuery(
    trpc.users.getOne.queryOptions({ id: userId })
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<UserIdViewLoading />}>
         <ErrorBoundary fallback={<UserIdViewError />}>
           <UserIdView userId={userId} />
         </ErrorBoundary>
        </Suspense>
    </HydrationBoundary>
  )
};

export default Page;

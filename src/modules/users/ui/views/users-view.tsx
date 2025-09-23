"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

const UsersView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.users.getMany.queryOptions()
  );

  return (
    <div>
      {JSON.stringify(data, null, 2)}</div>
  ) 
};

export default UsersView;

export const UsersViewLoading = () => {
    return (
        <LoadingState
          title="Loading users"
          description="Please wait while we fetch the user list."
        />
    )
}

export const UsersViewError = () => {
    return (
        <ErrorState
          title="Error loading users"
          description="There was an error fetching the user list. Please try again."
        />
    )
}

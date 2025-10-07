"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export const GamesView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.games.getMany.queryOptions({}));

  return (
    <div>
        {JSON.stringify(data)}
    </div>
  )
};

export const GamesViewLoading = () => {
  return (
    <LoadingState
      title="Loading games"
      description="Please wait while we fetch the game list."
    />
  );
};

export const GamesViewError = () => {
  return (
    <ErrorState
      title="Error loading games"
      description="There was an error fetching the game list. Please try again."
    />
  );
};
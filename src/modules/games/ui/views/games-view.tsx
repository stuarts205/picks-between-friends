"use client";
import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";

export const GamesView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.games.getMany.queryOptions({}));

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable data={data.items} columns={columns} />
      {data.items.length === 0 && (
        <EmptyState
          title="No games loaded for this week"
          description="There are no games to display at the moment."
        />
      )}
    </div>
  );
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

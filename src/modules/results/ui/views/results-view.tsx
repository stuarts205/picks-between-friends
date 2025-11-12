'use client'
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react'

interface ResultsViewProps {
    week?: number;
}

export const ResultsView = ({ week }: ResultsViewProps) => {
    const trpc = useTRPC();
    const { data : games } = useSuspenseQuery(
        trpc.results.getManyWeeklySelectedGames.queryOptions({
            week,
        })
    );

  return (
    <div>{JSON.stringify(games)}</div>
  )
}

export const ResultsViewLoading = () => (
  <LoadingState
    title="Loading games"
    description="Please wait while we fetch the game list."
  />
);

export const ResultsViewError = () => (
  <ErrorState
    title="Error loading games"
    description="There was an error fetching the game list. Please try again."
  />
);
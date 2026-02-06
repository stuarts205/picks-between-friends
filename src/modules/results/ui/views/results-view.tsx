"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { ResultsHeader } from "../components/results-header";

interface ResultsViewProps {
  week?: number;
}

export const ResultsView = ({ week }: ResultsViewProps) => {
  return (
    <>
      <div className="flex flex-col p-5 gap-6">
        <div>
          <ResultsHeader week={week} />
        </div>
      </div>
    </>
  );
};

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

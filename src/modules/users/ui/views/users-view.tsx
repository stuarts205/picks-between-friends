"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useUsersFilters } from "../../hooks/use-users-filters";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";

const UsersView = () => {
  const router = useRouter()
  const [filters, setFilters] = useUsersFilters();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.users.getMany.queryOptions({ ...filters })
  );

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable data={data.items} columns={columns} onRowClick={(row) => router.push(`/users/${row.id}`)} />
      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
      {data.items.length === 0 && (
        <EmptyState
          title="No users found"
          description="There are no users to display at the moment."
        />
      )}
    </div>
  );
};

export default UsersView;

export const UsersViewLoading = () => {
  return (
    <LoadingState
      title="Loading users"
      description="Please wait while we fetch the user list."
    />
  );
};

export const UsersViewError = () => {
  return (
    <ErrorState
      title="Error loading users"
      description="There was an error fetching the user list. Please try again."
    />
  );
};


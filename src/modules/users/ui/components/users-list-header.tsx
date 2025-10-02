"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon, XCircleIcon } from "lucide-react";
import React, { useState } from "react";
import NewUserDialog from "./new-user-dialog";
import { useUsersFilters } from "../../hooks/use-users-filters";
import { UsersSearchFilter } from "./users-search-filters";
import { DEFAULT_PAGE } from "@/constants";

const UsersListHeader = () => {
  const [filters, setFilters] = useUsersFilters();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isAnyFilterModified = !!filters.search;

  const onClearFilters = () => {
    setFilters({ search: '', page: DEFAULT_PAGE });
  }

  return (
    <>
      <NewUserDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-xl">Users</h5>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon /> New User
          </Button>
        </div>
        <div className="flex items-center gap-x-2 p-1">
          <UsersSearchFilter />
          {isAnyFilterModified && (
            <Button variant='outline' size='sm' onClick={onClearFilters}>
              <XCircleIcon /> Clear
            </Button>
          )}
        </div>

      </div>
    </>
  );
};

export default UsersListHeader;

"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import NewUserDialog from "./new-user-dialog";

const UsersListHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      </div>
    </>
  );
};

export default UsersListHeader;

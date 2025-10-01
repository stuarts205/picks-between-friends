"use client";
import { ColumnDef } from "@tanstack/react-table";
import { UserGetOne } from "../../types";
import { GeneratedAvatar } from "@/components/genterated-avatar";

export const columns: ColumnDef<UserGetOne>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <GeneratedAvatar
            seed={row.original.name}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            variant="initials"
          />
          <span className="font-semibold capitalize">{row.original.name}</span>
        </div>
      </div>
    ),
  },
];

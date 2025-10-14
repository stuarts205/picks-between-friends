"use client";
import { ColumnDef } from "@tanstack/react-table";
import { GameGetMany } from "../../types";
import { GeneratedAvatar } from "@/components/genterated-avatar";

export const columns: ColumnDef<GameGetMany[number]>[] = [
  {
    accessorKey: "game",
    header: "Game",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <span className="font-semibold">{row.original.away} at {row.original.home}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "favorite",
    header: "Favorite",
    cell: ({ row }) => <span>{row.original.favorite}</span>,
  }
  ,
  {
    accessorKey: "spread",
    header: "Spread",
    cell: ({ row }) => <span>{row.original.spread}</span>,
  }
];

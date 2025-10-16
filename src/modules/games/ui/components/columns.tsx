"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckIcon, MoreVerticalIcon } from "lucide-react";
import type { GameGetMany } from "../../types";

interface GameColumnsOptions {
  onEdit: (game: GameGetMany[number]) => void;
  onSelect: (game: GameGetMany[number]) => void;
  onRemove: (game: GameGetMany[number]) => void;
}

export const createColumns = ({
  onEdit,
  onSelect,
  onRemove,
}: GameColumnsOptions): ColumnDef<GameGetMany[number]>[] => [
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const game = row.original;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem onClick={() => onSelect(game)}>
              Select Game
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRemove(game)}>
              Remove Game
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(game)}>
              Change Spread
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "selected",
    header: "Selected",
    cell: ({ row }) => (
      <span>{row.original.selected && <CheckIcon className="size-4" />}</span>
    ),
  },
  {
    accessorKey: "game",
    header: "Game",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <span className="font-semibold">
          {row.original.away} at {row.original.home}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "favorite",
    header: "Favorite",
    cell: ({ row }) => <span>{row.original.favorite}</span>,
  },
  {
    accessorKey: "spread",
    header: "Spread",
    cell: ({ row }) => <span>{row.original.spread}</span>,
  },
];

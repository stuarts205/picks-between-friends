import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GameGetOne } from "../../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

interface EditGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: GameGetOne;
  onSuccess?: (id?: string) => void;
}

export default function EditGameDialog({
  open,
  onOpenChange,
  game,
  onSuccess,
}: EditGameDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [spread, setSpread] = useState(game.spread || "");

  const changeSpread = useMutation(
    trpc.games.updateSpread.mutationOptions({
      onSuccess: async (data) => {
        onOpenChange(false);
        await queryClient.invalidateQueries(
          trpc.games.getMany.queryOptions({})
        );
        toast.success("Game updated successfully");
        onSuccess?.(data.id);
      },
    })
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-full">
        <DialogHeader>
          <DialogTitle>
            {" "}
            {game.home} vs {game.away}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Input
            value={spread}
            onChange={(e) => setSpread(e.target.value)}
            placeholder="Spread"
          />
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="mt-4"
              onClick={() => changeSpread.mutate({ id: game.id, spread })}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

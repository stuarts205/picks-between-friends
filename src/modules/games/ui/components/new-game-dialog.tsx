"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import React from "react";
import { GameForm } from "./game-form";
import { useRouter } from "next/navigation";

interface NewMeetingDialogProps  {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewMeetingDialog = ({ open, onOpenChange }: NewMeetingDialogProps ) => {
  const router = useRouter();
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Game"
      description="Create a new game."
    >
      <GameForm
        onSuccess={(id) => {
          onOpenChange(false);
          router.push(`/games/${id}`);
        }}
        onCancel={() => onOpenChange(false)}
/>
    </ResponsiveDialog>
  );
};

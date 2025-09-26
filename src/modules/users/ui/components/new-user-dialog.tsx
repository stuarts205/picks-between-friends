"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import React from "react";
import { UserForm } from "./user-form";

interface NewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewUserDialog = ({ open, onOpenChange }: NewUserDialogProps) => {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New User"
      description="Create a new user."
    >
      <UserForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
};

export default NewUserDialog;

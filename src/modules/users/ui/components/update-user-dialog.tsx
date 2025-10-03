"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import React from "react";
import { UserForm } from "./user-form";
import { UserGetOne } from "../../types";

interface UpdateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: UserGetOne
}

const UpdateUserDialog = ({ open, onOpenChange, initialValues }: UpdateUserDialogProps) => {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User"
      description="Edit the user information."
    >
      <UserForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
};

export default UpdateUserDialog;

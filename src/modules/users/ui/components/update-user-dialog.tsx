"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import React from "react";
import { UserForm } from "./user-form";
import { UserGetOne } from "../../types";

interface NewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: UserGetOne;
}

const UpdateUserDialog = ({ open, onOpenChange, initialValues }: NewUserDialogProps) => {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User"
      description="Edit an existing user."
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

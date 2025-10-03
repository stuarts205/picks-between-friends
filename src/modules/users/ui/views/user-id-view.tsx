"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import React, { use } from "react";
import { UserIdViewHeader } from "../components/user-id-view-header";
import { GeneratedAvatar } from "@/components/genterated-avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useState } from "react";
import UpdateUserDialog from "../components/update-user-dialog";

interface UserIdViewProps {
  userId: string;
}

export const UserIdView = ({ userId }: UserIdViewProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const [updateUserDialogOpen, setUpdateUserDialogOpen] = useState(false);

  const { data } = useSuspenseQuery(
    trpc.users.getOne.queryOptions({ id: userId })
  );

  const removeUser = useMutation(
    trpc.users.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.users.getMany.queryOptions({})
        );
        router.push("/users");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    `Are you sure you want to remove ${data.name?.split(" ")[0]}?`,
    "This action cannot be undone. All picks for this user will be deleted."
  );

  const handleRemoveUser = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    await removeUser.mutateAsync({ id: userId });
  };

  return (
    <>
      <RemoveConfirmation />
      <UpdateUserDialog
        open={updateUserDialogOpen}
        onOpenChange={setUpdateUserDialogOpen}
        initialValues={data}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <UserIdViewHeader
          userId={userId}
          userName={data.name}
          onEdit={() => setUpdateUserDialogOpen(true)}
          onRemove={handleRemoveUser}
        />
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
            <div className="flex items-center gap-x-4">
              <GeneratedAvatar
                variant="initials"
                seed={data.name}
                className="size-10"
              />
              <h2 className="text-2xl font-medium">{data.name}</h2>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-x-2 [&>svg]:size-4"
            >
              <Star className="text-yellow-500" />
              {data.overAllPoints || 0} total points
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
};

export const UserIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading user"
      description="Please wait while we fetch the user."
    />
  );
};

export const UserIdViewError = () => {
  return (
    <ErrorState
      title="Error loading user"
      description="There was an error fetching the user. Please try again."
    />
  );
};

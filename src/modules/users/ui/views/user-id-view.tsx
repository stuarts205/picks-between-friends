"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { UserIdViewHeader } from "../components/user-id-view-header";
import { GeneratedAvatar } from "@/components/genterated-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

interface UserIdViewProps {
  userId: string;
}

export const UserIdView = ({ userId }: UserIdViewProps) => {
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(
    trpc.users.getOne.queryOptions({ id: userId }),
  );

  const { data: sessionUser } = useSuspenseQuery(
    trpc.users.getOneBySession.queryOptions(),
  );

  const [overAllPoints, setOverAllPoints] = useState(
    String(data.overAllPoints ?? 0),
  );
  const [weeklyPoints, setWeeklyPoints] = useState(
    String(data.weeklyPoints ?? 0),
  );

  useEffect(() => {
    setOverAllPoints(String(data.overAllPoints ?? 0));
    setWeeklyPoints(String(data.weeklyPoints ?? 0));
  }, [data.overAllPoints, data.weeklyPoints]);

  const removeUser = useMutation(
    trpc.users.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.users.getMany.queryOptions({}),
        );
        router.push("/users");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Remove user. Are you sure?",
    "This action cannot be undone. All picks will be removed as well.",
  );

  const updatePoints = useMutation(
    trpc.users.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.users.getMany.queryOptions({}),
        );
        await queryClient.invalidateQueries(
          trpc.users.getOne.queryOptions({ id: userId }),
        );
        toast.success("Points updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const setPassword = useMutation(
    trpc.users.setPassword.mutationOptions({
      onSuccess: () => {
        setNewPassword("");
        toast.success("Password updated. User has been signed out everywhere.");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const [SetPasswordConfirmation, confirmSetPassword] = useConfirm(
    "Set a new password?",
    "This will immediately replace the password and sign the user out of all active sessions.",
  );

  const handleRemove = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    removeUser.mutate({ id: userId });
  };

  const handleSetPassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    const ok = await confirmSetPassword();
    if (!ok) return;

    setPassword.mutate({
      id: userId,
      newPassword,
    });
  };

  const handleUpdatePoints = () => {
    const parsedOverAllPoints = Number(overAllPoints);
    const parsedWeeklyPoints = Number(weeklyPoints);

    if (
      !Number.isInteger(parsedOverAllPoints) ||
      !Number.isInteger(parsedWeeklyPoints)
    ) {
      toast.error("Points must be whole numbers.");
      return;
    }

    updatePoints.mutate({
      id: userId,
      overAllPoints: parsedOverAllPoints,
      weeklyPoints: parsedWeeklyPoints,
    });
  };

  return (
    <>
      <RemoveConfirmation />
      <SetPasswordConfirmation />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <UserIdViewHeader
          userId={userId}
          userName={data.name}
          onRemove={handleRemove}
        />
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
            <div className="flex items-center gap-x-4">
              <GeneratedAvatar
                variant="initials"
                seed={data.name}
                className="size-10"
              />
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-medium">{data.name}</h2>
                <p className="text-sm text-muted-foreground">{data.email}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-x-2 [&>svg]:size-4"
            >
              <Star className="text-yellow-500" />
              {data.overAllPoints || 0} total points
            </Badge>

            {sessionUser.role === 1 && (
              <div className="w-full md:max-w-5xl grid grid-cols-1 md:grid-cols-2 items-stretch gap-4">
                <div className="rounded-md border p-4 flex flex-col gap-y-3 h-full">
                  <p className="font-medium">Points</p>
                  <p className="text-sm text-muted-foreground">
                    Update overall and weekly points directly.
                  </p>
                  <div className="flex flex-col md:flex-row md:items-end gap-2">
                    <div className="w-full md:flex-1">
                      <Input
                        type="number"
                        value={overAllPoints}
                        onChange={(e) => setOverAllPoints(e.target.value)}
                        placeholder="Overall points"
                        disabled={updatePoints.isPending}
                        className="w-full"
                      />
                    </div>
                    <div className="w-full md:flex-1">
                      <Input
                        type="number"
                        value={weeklyPoints}
                        onChange={(e) => setWeeklyPoints(e.target.value)}
                        placeholder="Weekly points"
                        disabled={updatePoints.isPending}
                        className="w-full"
                      />
                    </div>
                    <div className="w-full md:flex-1">
                      <Button
                        type="button"
                        onClick={handleUpdatePoints}
                        disabled={updatePoints.isPending}
                        className="w-full"
                      >
                        Update Points
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4 flex flex-col gap-y-3 h-full">
                  <p className="font-medium">Security</p>
                  <p className="text-sm text-muted-foreground">
                    Set a password.
                  </p>
                  <div className="flex flex-col md:flex-row md:items-end gap-2">
                    <div className="w-full md:flex-1">
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={setPassword.isPending}
                        className="w-full"
                      />
                    </div>
                    <div className="w-full md:flex-1">
                      <Button
                        type="button"
                        onClick={handleSetPassword}
                        disabled={setPassword.isPending}
                        className="w-full"
                      >
                        Set Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

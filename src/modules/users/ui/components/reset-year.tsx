"use client";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const ResetYear = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const resetYear = useMutation(
    trpc.season.resetYear.mutationOptions({
      onSuccess: ({ year }) => {
        toast.success(`Year reset. The ${year} season is ready.`);
        // Every session was deleted along with the users, so sign back in.
        queryClient.clear();
        router.push("/sign-in");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const [ResetConfirmation, confirmReset] = useConfirm(
    "Reset the year. Are you sure?",
    "This deletes ALL users (including you and every admin), logins, passwords, picks, comments and games, and moves the season to week 1 of next year. This action cannot be undone.",
  );

  const handleReset = async () => {
    const ok = await confirmReset();
    if (!ok) return;
    resetYear.mutate();
  };

  return (
    <>
      <ResetConfirmation />
      <div className="py-4 px-4 md:px-8 flex items-center justify-between">
        <h5 className="font-medium text-xl">Reset Year</h5>
        <Button onClick={handleReset} disabled={resetYear.isPending}>
          Reset Year
        </Button>
      </div>
    </>
  );
};

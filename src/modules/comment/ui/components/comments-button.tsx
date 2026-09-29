"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageCircleIcon } from "lucide-react";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";

const TITLE = "Comments";
const DESCRIPTION = "Talk trash with your friends.";
const REFETCH_INTERVAL_MS = 15_000;

export const CommentsButton = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    ...trpc.comment.getMany.queryOptions(),
    // Only fetch while the panel is open, and poll for new comments from others
    enabled: open,
    refetchInterval: open ? REFETCH_INTERVAL_MS : false,
  });

  const createComment = useMutation(
    trpc.comment.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.comment.getMany.queryOptions()
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const onPost = async (content: string) => {
    await createComment.mutateAsync({ content });
  };

  const body = (
    <>
      <CommentList comments={comments} isLoading={isLoading} />
      <CommentForm onSubmit={onPost} isPending={createComment.isPending} />
    </>
  );

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-40 size-12 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Open comments"
      >
        <MessageCircleIcon className="size-5" />
      </Button>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>{TITLE}</DrawerTitle>
              <DrawerDescription>{DESCRIPTION}</DrawerDescription>
            </DrawerHeader>
            {body}
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="flex flex-col">
            <SheetHeader>
              <SheetTitle>{TITLE}</SheetTitle>
              <SheetDescription>{DESCRIPTION}</SheetDescription>
            </SheetHeader>
            {body}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

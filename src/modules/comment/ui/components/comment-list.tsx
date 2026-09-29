"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/genterated-avatar";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef } from "react";

export interface CommentItem {
  id: string;
  userName: string;
  userImage?: string | null;
  content: string;
  // Dates arrive from tRPC as strings since there is no superjson transformer
  createdAt: Date | string | null;
}

interface CommentListProps {
  comments: CommentItem[];
  isLoading?: boolean;
}

export const CommentList = ({ comments, isLoading }: CommentListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
        Loading comments...
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
        No comments yet.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <ul className="flex flex-col gap-4">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            {comment.userImage ? (
              <Avatar className="size-8">
                <AvatarImage src={comment.userImage} />
              </Avatar>
            ) : (
              <GeneratedAvatar
                seed={comment.userName}
                variant="initials"
                className="size-8"
              />
            )}
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{comment.userName}</span>
                {comment.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words text-sm">
                {comment.content}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div ref={bottomRef} />
    </div>
  );
};

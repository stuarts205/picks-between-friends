"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { COMMENT_MAX_LENGTH, commentInsertSchema } from "../../schemas";

type CommentFormValues = z.infer<typeof commentInsertSchema>;

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isPending?: boolean;
}

export const CommentForm = ({
  onSubmit: onPost,
  isPending = false,
}: CommentFormProps) => {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentInsertSchema),
    defaultValues: {
      content: "",
    },
  });

  const content = form.watch("content");

  const onSubmit = async (values: CommentFormValues) => {
    try {
      await onPost(values.content);
      form.reset();
    } catch {
      // Keep the text so the user can retry; the error toast is shown by the caller
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 border-t p-4"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add a comment..."
                  className="max-h-40 resize-none"
                  maxLength={COMMENT_MAX_LENGTH}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isPending) form.handleSubmit(onSubmit)();
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {content.length}/{COMMENT_MAX_LENGTH}
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isPending}
          >
            <SendIcon />
            {isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

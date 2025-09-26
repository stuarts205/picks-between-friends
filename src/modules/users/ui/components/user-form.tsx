import React, { useState } from "react";
import { UserGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { usersInsertSchema } from "../../schemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { init } from "next/dist/compiled/webpack/webpack";
import { toast } from "sonner";
import { on } from "events";
import { authClient } from "@/lib/auth-client";

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: UserGetOne;
}

export const UserForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: UserFormProps) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const createUser = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.users.getMany.queryOptions());
        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.users.getOne.queryOptions({ id: initialValues.id })
          );
        }
        toast.success("User created successfully");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Error creating user: ${error.message}`);
      },
    })
  );

  const form = useForm<z.infer<typeof usersInsertSchema>>({
    resolver: zodResolver(usersInsertSchema),
    defaultValues: {
      name: initialValues?.name || "",
      email: initialValues?.email || "",
      password: "",
      confirmPassword: "",
      emailVerified: initialValues?.emailVerified || false,
    },
  });

  const isEdit = !!initialValues?.id;
  const isPending = createUser.isPending;

  const onSubmit = (values: z.infer<typeof usersInsertSchema>) => {
    if (isEdit) {
      console.log("edit user - not implemented yet");
    } else {
      setError(null);
      setPending(true);

      authClient.signUp.email(
        {
          name: values.name,
          email: values.email,
          password: values.password,
          callbackURL: "/",
        },
        {
          onSuccess: async () => {
            toast.success("User created successfully");
            onSuccess?.();
            setPending(false);
            await queryClient.invalidateQueries(
              trpc.users.getMany.queryOptions()
            );
            if (initialValues?.id) {
              await queryClient.invalidateQueries(
                trpc.users.getOne.queryOptions({ id: initialValues.id })
              );
            }
            toast.success("User created successfully");
            onSuccess?.();
          },
          onError: (error) => {
            setPending(false);
            setError(
              error.error.message || "Something went wrong. Please try again."
            );
          },
        }
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. John Doe"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. john.doe@example.com"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="**********"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="**********"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button
              variant="ghost"
              disabled={isPending}
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button disabled={isPending} type="submit">
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

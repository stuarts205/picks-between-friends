import React, { useState } from "react";
import { UserGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { usersInsertSchema, usersUpdateSchema } from "../../schemas";
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
import { toast } from "sonner";
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
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const isEdit = !!initialValues?.id;

  const createUser = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.users.getMany.queryOptions({}),
        );
        toast.success("User created successfully");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Error creating user: ${error.message}`);
      },
    }),
  );

  const updateUser = useMutation(
    trpc.users.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.users.getMany.queryOptions({}),
        );
        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.users.getOne.queryOptions({ id: initialValues.id }),
          );
        }
        toast.success("User updated successfully");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Error updating user: ${error.message}`);
      },
    }),
  );

  const createForm = useForm<z.infer<typeof usersInsertSchema>>({
    resolver: zodResolver(usersInsertSchema),
    defaultValues: {
      name: initialValues?.name || "",
      email: initialValues?.email || "",
      password: "",
      confirmPassword: "",
      emailVerified: initialValues?.emailVerified || false,
    },
  });

  const updateForm = useForm<z.infer<typeof usersUpdateSchema>>({
    resolver: zodResolver(usersUpdateSchema),
    defaultValues: {
      id: initialValues?.id || "",
      overAllPoints: initialValues?.overAllPoints ?? 0,
      weeklyPoints: initialValues?.weeklyPoints ?? 0,
    },
  });

  const isPending = createUser.isPending || updateUser.isPending;

  const onCreateSubmit = (values: z.infer<typeof usersInsertSchema>) => {
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
            trpc.users.getMany.queryOptions({}),
          );
          if (initialValues?.id) {
            await queryClient.invalidateQueries(
              trpc.users.getOne.queryOptions({ id: initialValues.id }),
            );
          }
          toast.success("User created successfully");
          onSuccess?.();
        },
        onError: (error) => {
          setPending(false);
          toast.error(
            error.error.message || "Something went wrong. Please try again.",
          );
        },
      },
    );
  };

  const onUpdateSubmit = (values: z.infer<typeof usersUpdateSchema>) => {
    updateUser.mutate(values);
  };

  if (isEdit) {
    return (
      <Form {...updateForm}>
        <form
          onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
          className="space-y-4"
        >
          <FormField
            control={updateForm.control}
            name="overAllPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overall Points</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={updateForm.control}
            name="weeklyPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Points</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isPending} />
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
              Update
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...createForm}>
      <form
        onSubmit={createForm.handleSubmit(onCreateSubmit)}
        className="space-y-4"
      >
        <FormField
          control={createForm.control}
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
          control={createForm.control}
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
          control={createForm.control}
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
          control={createForm.control}
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
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
};

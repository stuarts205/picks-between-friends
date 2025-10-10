"use client";
import React, { useEffect, useState } from "react";
import { GameGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { gamesInsertSchema } from "../../schemas";
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
import { CommandSelect } from "@/components/command-select";

interface GameFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: GameGetOne;
}

export const GameForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: GameFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const leagues = ["NFL", "College"];

  const [open, setOpen] = useState(false);
  const [leagueSearch, setLeagueSearch] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [teams, setTeams] = useState<{ name: string; league: string }[]>([]);

  const { data: allTeams = [] } = useQuery(
    trpc.teams.getMany.queryOptions({ league: leagueSearch })
  );

  console.log("All teams:", allTeams);

  const createGame = useMutation(
    trpc.games.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.games.getMany.queryOptions({})
        );
        toast.success("Game created successfully");
        onSuccess?.(data.id);
      },
      onError: (error) => {
        toast.error(`Error creating game: ${error.message}`);
      },
    })
  );

  const onLeagueSelect = (field: any, value: string) => {
    field.onChange(value);
    setLeagueSearch(value);
    setOpen(false);
    setTeams(allTeams);
  };

  const updateGame = useMutation(
    trpc.games.update.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.games.getMany.queryOptions({})
        );
        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.games.getOne.queryOptions({ id: initialValues.id })
          );
        }
        toast.success("Game updated successfully");
        onSuccess?.(data.id);
      },
      onError: (error) => {
        toast.error(`Error updating game: ${error.message}`);
      },
    })
  );

  const form = useForm<z.infer<typeof gamesInsertSchema>>({
    resolver: zodResolver(gamesInsertSchema),
    defaultValues: {
      gameId: initialValues?.gameid || "",
      week: initialValues?.week ?? undefined,
      home: initialValues?.home || "",
      away: initialValues?.away || "",
      spread: initialValues?.spread || "",
      league: initialValues?.league || "",
      home_id: initialValues?.homeId || "",
      away_id: initialValues?.awayId || "",
      favorite: initialValues?.favorite || "",
    },
  });

  useEffect(() => {
    console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);

  const isEdit = !!initialValues?.id;
  const isPending = createGame.isPending || updateGame.isPending;

  const onSubmit = (values: z.infer<typeof gamesInsertSchema>) => {
    console.log("Submitting form with values:", values);
    if (isEdit) {
      updateGame.mutate({ id: initialValues.id, ...values });
    } else {
      createGame.mutate(values);
      console.log("Game created with values:", values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="gameId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 12345"
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
          name="week"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Week</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 1"
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
          name="league"
          render={({ field }) => (
            <FormItem>
              <FormLabel>League</FormLabel>
              <FormControl>
                <CommandSelect
                  options={leagues.map((league) => ({
                    id: league,
                    value: league,
                    children: (
                      <div className="flex items-center gap-2">
                        <span>{league}</span>
                      </div>
                    ),
                  }))}
                  onSelect={(value) => onLeagueSelect(field, value)}
                  value={field.value ?? ""}
                  placeHolder="Select a league"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="home"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Home Team</FormLabel>
              <FormControl>
                <CommandSelect
                  options={allTeams.map((team) => ({
                    id: team.id,
                    value: team.id,
                    children: (
                      <div className="flex items-center gap-2">
                        <span>{`${team.name} ${team.nickname}`}</span>
                      </div>
                    ),
                  }))}
                  onSelect={field.onChange}
                  value={field.value ?? ""}
                  placeHolder="Select a team"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="away"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Away Team</FormLabel>
              <FormControl>
                <CommandSelect
                  options={allTeams.map((team) => ({
                    id: team.id,
                    value: team.id,
                    children: (
                      <div className="flex items-center gap-2">
                        <span>{`${team.name} ${team.nickname}`}</span>
                      </div>
                    ),
                  }))}
                  onSelect={field.onChange}
                  value={field.value ?? ""}
                  placeHolder="Select a team"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="spread"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spread</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. -3.5"
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
          name="favorite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favorite</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Patriots"
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

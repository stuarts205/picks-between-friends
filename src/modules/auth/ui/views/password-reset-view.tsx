"use client";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { GiAmericanFootballPlayer } from "react-icons/gi";

const formSchema = z.object({
  email: z.string().email(),
});

export const PasswordResetView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const hostUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    try {
      console.log("Requesting password reset for:", values.email);

      await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${hostUrl}/password-reset-form`,
      });

      router.push("/email-sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Reset password</h1>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="eg: email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={pending}>
                  Reset Password
                </Button>
                {!!error && (
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}
                <div className="text-center text-sm">
                  Remeber you password?{" "}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          <div
            className="bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 
            items-center justify-center"
          >
            <GiAmericanFootballPlayer className="text-white text-6xl" />
            <p className="text-2xl font-semibold text-white">Spencs Picks</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

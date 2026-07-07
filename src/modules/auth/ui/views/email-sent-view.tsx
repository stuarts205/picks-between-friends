"use client";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { GiAmericanFootballPlayer } from "react-icons/gi";

export const EmailSentView = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center py-32 gap-4">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-muted-foreground text-sm px-4">
                Please check your email for a link to reset your password.
              </p>
              <p className="text-muted-foreground text-sm px-4">
                Check your spam folder if you don&apos;t see the email.
              </p>
            </div>
          </div>
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

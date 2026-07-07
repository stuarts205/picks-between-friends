"use client";
import { SeasonGetOne } from "@/modules/season/type";
import { UserGetOne } from "@/modules/users/types";
import React, { useEffect, useState } from "react";

interface HomeViewHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSeason: SeasonGetOne;
  user: UserGetOne;
}

export const HomeViewHeader = ({
  session,
  currentSeason,
  user,
}: HomeViewHeaderProps) => {
  const firstName = session?.user?.name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <>
      <div className="flex flex-col items-start gap-6">
        <h5 className="font-medium text-xl">Hello, {firstName}</h5>
        <div className="flex flex-col items-start justify-between gap-4">
          <div className="flex items-stretch justify-between gap-3 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border w-1/2">
              <h2 className="text-lg md:text-2xl font-medium">Total Points</h2>
              <p className="text-2xl font-medium">{user?.overAllPoints || 0}</p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border w-1/2">
              <h2 className="text-lg md:text-2xl font-medium">
                Last Week’s Points
              </h2>
              <p className="text-2xl font-medium">{user?.weeklyPoints || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

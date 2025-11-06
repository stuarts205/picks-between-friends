"use client";
import { UserGetOne } from "@/modules/users/types";
import React, { useEffect, useState } from "react";

interface HomeViewHeaderProps {
  session: any;
  currentSeason: any;
  user: UserGetOne;
}

export const HomeViewHeader = ({
  session,
  currentSeason,
  user,
}: HomeViewHeaderProps) => {
  console.log("HomeViewHeader user:", user);
  return (
    <>
      <div className="flex flex-col items-start gap-6">
        <h5 className="font-medium text-xl">Hello, {session?.user?.name}</h5>
        <div className="flex flex-col items-start justify-between gap-4">
          <div className="flex items-stretch justify-between gap-3 mb-8">
            <div className="flex items-center justify-between p-4 rounded-lg border w-1/2">
              <h2 className="text-2xl font-bold">Total Points</h2>
              <p className="text-2xl font-semibold">{user?.overAllPoints}</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border w-1/2">
              <h2 className="text-2xl font-bold">Last Week’s Points</h2>
              <p className="text-2xl font-semibold">{user?.weeklyPoints}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

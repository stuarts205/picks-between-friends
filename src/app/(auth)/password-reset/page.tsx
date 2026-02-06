import { auth } from "@/lib/auth";
import { PasswordResetView } from "@/modules/auth/ui/views/password-reset-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) {
    redirect("/");
  }

  return <PasswordResetView />;
};

export default Page;

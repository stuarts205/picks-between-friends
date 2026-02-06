import { auth } from "@/lib/auth";
import { PasswordResetForm } from "@/modules/auth/ui/views/password-reset-form";
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

  return <PasswordResetForm />;
};

export default Page;
import { auth } from "@/lib/auth";
import { EmailSentView } from "@/modules/auth/ui/views/email-sent-view";
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

  return <EmailSentView />;
};

export default Page;
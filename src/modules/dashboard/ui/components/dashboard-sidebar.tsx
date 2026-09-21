"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  CheckCircleIcon,
  Home,
  Target,
  User2Icon,
  ChartNoAxesCombined
} from "lucide-react";
import Link from "next/link";
import { GiAmericanFootballPlayer } from "react-icons/gi";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { DashboardUserButton } from "./dashboard-user-button";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const firstSection = [
  {
    icon: Home,
    label: "Home",
    href: "/",
  },
  {
    icon: Target,
    label: "Picks",
    href: "/picks",
  },
  {
    icon: ChartNoAxesCombined,
    label: "Stats",
    href: "/analytics",
  },
];

const adminSection = [
  {
    icon: CheckCircleIcon,
    label: "Games",
    href: "/games",
  },
  {
    icon: User2Icon,
    label: "Current Users",
    href: "/users",
  },
];

export const DashboardSidebar = () => {
  const pathName = usePathname();
  const trpc = useTRPC();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session?.data?.user?.id) {
        setUser(session.data.user.id);
      }
    });
  }, []);

  const userQuery = useQuery(
    trpc.users.getOne.queryOptions({
      id: user,
    })
  );

  return (
    <Sidebar>
      <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href="/" className="flex items-center gap-2 px-2 pt-2">
          <GiAmericanFootballPlayer className="text-4xl text-white" />
          <p className="text-2xl font-semibold">Spencs Picks</p>
        </Link>
      </SidebarHeader>
      <div className="px-4 py-2">
        <Separator className="opacity-10 text-[#5D6B68]" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-side-accent from-5% via-30% via-sidear/50 to-sidebar/50",
                      pathName === item.href &&
                        "bg-linear-to-r/oklch border-[#5D6B68]/10"
                    )}
                    isActive={pathName === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-4 py-2">
          <Separator className="opacity-10 text-[#5D6B68]" />
        </div>
        {userQuery.data?.role === 1 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminSection.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-side-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                        pathName === item.href &&
                          "bg-linear-to-r/oklch border-[#5D6B68]/10"
                      )}
                      isActive={pathName === item.href}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-5" />
                        <span className="text-sm font-medium tracking-tight">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="text-white">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};

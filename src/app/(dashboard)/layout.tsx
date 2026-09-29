import { SidebarProvider } from "@/components/ui/sidebar";
import { CommentsButton } from "@/modules/comment/ui/components/comments-button";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="flex flex-col h-screen w-screen">
        <DashboardNavbar />
        {children}
      </main>
      <CommentsButton />
    </SidebarProvider>
  );
};

export default Layout;

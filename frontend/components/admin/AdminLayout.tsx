"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, syncUser } = useAuthStore();
  const { isCollapsed } = useSidebar();
  const [synced, setSynced] = useState(false);

  // Sync user data on mount to get latest onboardingCompleted status
  useEffect(() => {
    if (user && !synced) {
      syncUser().then(() => setSynced(true));
    }
  }, [user, synced, syncUser]);

  useEffect(() => {
    if (!user) {
      router.push("/admin");
    } else if (synced && !user.onboardingCompleted) {
      router.push("/admin/onboarding");
    }
  }, [user, router, synced]);

  // Show loading while syncing or if not logged in
  if (!user || (!synced && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // After sync, if onboarding not completed, the useEffect will redirect
  if (!user.onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <main
        className={cn(
          "pl-0 pt-16 lg:pt-0 transition-all duration-300",
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <div className="p-4 lg:p-6 animate-fade-in-up">{children}</div>
      </main>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}

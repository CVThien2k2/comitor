"use client"
import { ChatSidebar } from "@/components/global/chat-sidebar";
import { AuthWrapper } from "@/components/providers/auth-wrapper"
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
  <AuthWrapper>
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar isOpen={!sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  </AuthWrapper>
  );
}

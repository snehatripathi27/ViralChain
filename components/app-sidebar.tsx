"use client";

import { Plus, Sparkles, Waves } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";

type SidebarPrompt = {
  id: string;
  label: string;
  prompt: string;
  meta?: string;
};

type AppSidebarProps = {
  onNewThread: () => void;
  onUsePrompt: (prompt: string) => void;
  promptIdeas: SidebarPrompt[];
};

export function AppSidebar({ onNewThread, onUsePrompt, promptIdeas }: AppSidebarProps) {
  const { setOpenMobile } = useSidebar();

  function handleNewThread() {
    onNewThread();
    setOpenMobile(false);
  }

  function handleUsePrompt(prompt: string) {
    onUsePrompt(prompt);
    setOpenMobile(false);
  }

  return (
    <Sidebar>
      <SidebarHeader className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-accent text-sidebar-accent-foreground">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">ViralChain</p>
            <p className="text-xs text-muted-foreground">Simple crypto content workspace</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quick prompts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {promptIdeas.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton type="button" onClick={() => handleUsePrompt(item.prompt)}>
                    <Sparkles />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <button
          type="button"
          onClick={handleNewThread}
          className="flex w-full items-center justify-between rounded-2xl bg-sidebar-primary px-4 py-3 text-sm font-medium text-sidebar-primary-foreground transition-opacity hover:opacity-90"
        >
          <span>New thread</span>
          <Plus className="h-4 w-4" />
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

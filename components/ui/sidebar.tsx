"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "18rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";

type SidebarContextValue = {
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
};

function SidebarProvider({ defaultOpen = false, className, style, children, ...props }: SidebarProviderProps) {
  const [openMobile, setOpenMobile] = React.useState(defaultOpen);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const update = () => {
      setIsMobile(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const value = {
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar: () => setOpenMobile((current) => !current)
  };

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
            ...style
          } as React.CSSProperties
        }
        className={cn("flex min-h-screen w-full bg-background text-foreground", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.ComponentProps<"aside"> & {
  side?: "left" | "right";
};

function Sidebar({ side = "left", className, children, ...props }: SidebarProps) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <>
        <div
          aria-hidden="true"
          className={cn(
            "fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 md:hidden",
            openMobile ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setOpenMobile(false)}
        />
        <aside
          data-slot="sidebar"
          className={cn(
            "fixed inset-y-0 z-50 flex w-[var(--sidebar-width-mobile)] max-w-[86vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-200 md:hidden",
            side === "left" ? "left-0" : "right-0 border-l border-r-0",
            openMobile ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full",
            className
          )}
          {...props}
        >
          {children}
        </aside>
      </>
    );
  }

  return (
    <aside
      data-slot="sidebar"
      className={cn(
        "hidden h-screen w-[var(--sidebar-width)] shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col",
        side === "right" && "order-last border-l border-r-0",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-inset" className={cn("flex min-h-screen min-w-0 flex-1 flex-col", className)} {...props} />;
}

function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-slot="sidebar-trigger"
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-10 w-10 rounded-full text-muted-foreground hover:text-foreground md:hidden", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" className={cn("border-b border-sidebar-border px-4 py-4", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-content" className={cn("flex-1 overflow-y-auto px-3 py-4", className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" className={cn("border-t border-sidebar-border px-3 py-4", className)} {...props} />;
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="sidebar-group" className={cn("space-y-3 px-1 py-2", className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="sidebar-group-label"
      className={cn("px-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground", className)}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group-content" className={cn("space-y-1", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" className={cn("space-y-1", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" className={cn("list-none", className)} {...props} />;
}

type SidebarMenuButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
};

function SidebarMenuButton({ asChild = false, isActive = false, className, ...props }: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
};

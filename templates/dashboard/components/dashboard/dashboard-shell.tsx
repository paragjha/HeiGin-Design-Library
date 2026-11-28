"use client";

import * as React from "react";
import {
  Building2,
  CircleHelp,
  FileText,
  FolderClosed,
  Gauge,
  Home,
  Inbox,
  KanbanSquare,
  ListChecks,
  Menu,
  MessageSquarePlus,
  Settings,
  Share2,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { AppSidebar, Avatar, Drawer, DrawerContent, DrawerTrigger, HeiGinMark, WorkspaceSwitcher, type AppSidebarProps, type Workspace } from "@heigin/ui";
import { dashboardConfig } from "@/lib/dashboard-config";
import { cn } from "@/lib/dashboard-utils";

const ICONS = {
  sparkles: Sparkles,
  kanban: KanbanSquare,
  inbox: Inbox,
  users: Users,
  building: Building2,
  gauge: Gauge,
  folder: FolderClosed,
  help: CircleHelp,
  settings: Settings,
  home: Home,
  chat: MessageSquarePlus,
  tasks: ListChecks,
  video: Video,
  file: FileText,
  share: Share2,
} as const;
const icon = (name?: string) => {
  const Icon = name ? ICONS[name as keyof typeof ICONS] : undefined;
  return Icon ? <Icon /> : undefined;
};

export interface DashboardShellProps {
  children: React.ReactNode;
  /** Client-side routing for every sidebar link, e.g. renderLink={(p) => <Link {...p} />}. */
  renderLink?: AppSidebarProps["renderLink"];
  className?: string;
}

/**
 * The app frame for the dashboard pages: the two-level sidebar (area rail plus the current area's
 * pages) in a full-height column, and the page beside it. Below 768px the sidebar moves into a
 * left drawer behind a menu button.
 */
export function DashboardShell({ children, renderLink, className }: DashboardShellProps) {
  const { brand, user, workspaces, rail, nav, upgrade } = dashboardConfig;
  const [workspace, setWorkspace] = React.useState<Workspace>(workspaces[0]!);
  const [current, setCurrent] = React.useState(nav.current);

  // Without a router the links only move the highlight, so the template can be tried as it is.
  const link: AppSidebarProps["renderLink"] =
    renderLink ??
    ((props) => (
      <a
        {...props}
        onClick={(e) => {
          if (!props.href.startsWith("#") || props.href.startsWith("#area-")) return;
          e.preventDefault();
          setCurrent(props.href);
        }}
      />
    ));

  const sidebar = (
    <AppSidebar
      brand={brand.logoSrc ? <img src={brand.logoSrc} alt={brand.name} width={36} height={36} className="rounded-lg" /> : <HeiGinMark size={36} title={brand.name} />}
      rail={rail.groups.map((g) => g.map((r) => ({ label: r.label, href: r.href, icon: icon(r.icon)! })))}
      railFooter={rail.footer.map((r) => ({ label: r.label, href: r.href, icon: icon(r.icon)! }))}
      currentRail={rail.current}
      header={
        <div className="flex items-center gap-2">
          <Avatar name={user.name} src={user.photo} size="sm" />
          <WorkspaceSwitcher variant="stacked" current={workspace} owned={workspaces} onSelect={setWorkspace} onNew={() => {}} className="min-w-0 flex-1" />
        </div>
      }
      groups={nav.groups.map((g) => ({ label: g.label, items: g.items.map((it) => ({ label: it.label, href: it.href, icon: icon("icon" in it ? it.icon : undefined), count: "count" in it ? it.count : undefined })) }))}
      currentHref={current}
      renderLink={link}
      footer={
        upgrade && (
          <div className="db-upgrade">
            <p className="db-upgrade__title">{upgrade.title}</p>
            <p className="db-upgrade__body">{upgrade.body}</p>
            <a href={upgrade.cta.href} className="db-upgrade__cta">
              {upgrade.cta.label}
            </a>
          </div>
        )
      }
    />
  );

  return (
    <div className={cn("db", className)}>
      <aside className="db-side max-md:hidden">{sidebar}</aside>
      <div className="db-main">
        <div className="db-topbar md:hidden">
          <Drawer>
            <DrawerTrigger className="db-menu" aria-label="Open navigation">
              <Menu aria-hidden="true" />
            </DrawerTrigger>
            <DrawerContent title="Navigation" side="left" width="min(304px, 92vw)" className="db-drawer">
              {sidebar}
            </DrawerContent>
          </Drawer>
          <span className="font-semibold">{workspace.name}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

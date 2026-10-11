"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Code2, Menu, Users } from "lucide-react";
import { Drawer, DrawerContent, IconButton, SidebarNav, ToastProvider, type SidebarNavGroup } from "@heigin/ui";
import { LogoMark } from "./logo";

const groups: SidebarNavGroup[] = [
  {
    items: [
      { label: "Today", href: "/", icon: <CalendarCheck strokeWidth={1.6} /> },
      { label: "Leads", href: "/leads", icon: <Users strokeWidth={1.6} />, count: 2 },
    ],
  },
  {
    label: "Examples",
    items: [{ label: "Copied source", href: "/copied", icon: <Code2 strokeWidth={1.6} /> }],
  },
];

/** Client shell: needs the pathname (current nav item) and drawer state. Pages stay Server Components. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (onNavigate?: () => void) => (
    <SidebarNav
      groups={groups}
      currentHref={pathname}
      renderLink={({ href, ...props }) => <Link href={href} {...props} onClick={onNavigate} />}
    />
  );

  return (
    <ToastProvider>
      <div className="shell">
        <aside className="shell__sidebar">
          <div className="shell__brand">
            <LogoMark />
            Northwind (demo)
          </div>
          {nav()}
        </aside>
        <header className="shell__topbar">
          <div className="shell__brand" style={{ padding: 0 }}>
            <LogoMark />
            Northwind (demo)
          </div>
          <IconButton label="Open navigation" icon={<Menu strokeWidth={1.6} />} onClick={() => setOpen(true)} />
        </header>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent side="left" title="Navigation" closeLabel="Close navigation">
            {nav(() => setOpen(false))}
          </DrawerContent>
        </Drawer>
        <main className="shell__main">{children}</main>
      </div>
    </ToastProvider>
  );
}

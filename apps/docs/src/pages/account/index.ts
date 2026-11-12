import * as React from "react";
import { AccountOverview } from "./AccountOverview";
import { MyLibrary } from "./MyLibrary";
import { SavedComponents } from "./SavedComponents";
import { Purchases } from "./Purchases";
import { Billing } from "./Billing";
import { McpConfig } from "./McpConfig";
import { AccountSettings } from "./AccountSettings";

export {
  AccountOverview,
  MyLibrary,
  SavedComponents,
  Purchases,
  Billing,
  McpConfig,
  AccountSettings,
};

export interface AccountNavItem {
  id: string;
  label: string;
  path: string;
  Component: React.ComponentType;
}

export const ACCOUNT_NAV_ITEMS: readonly AccountNavItem[] = [
  { id: "overview", label: "Overview", path: "/account", Component: AccountOverview },
  { id: "library", label: "My Library", path: "/account/library", Component: MyLibrary },
  { id: "saved", label: "Saved", path: "/account/saved", Component: SavedComponents },
  { id: "purchases", label: "Purchases", path: "/account/purchases", Component: Purchases },
  { id: "billing", label: "Billing", path: "/account/billing", Component: Billing },
  { id: "mcp", label: "MCP Config", path: "/account/mcp", Component: McpConfig },
  { id: "settings", label: "Settings", path: "/account/settings", Component: AccountSettings },
];

/** Matches `/account` and `/account/*` routes to their corresponding shell component. */
export function renderAccountRoute(route: string): React.ReactElement | null {
  if (route === "/account/mcp-config") {
    return React.createElement(McpConfig);
  }
  const match = ACCOUNT_NAV_ITEMS.find((item) => item.path === route);
  if (!match) return null;
  return React.createElement(match.Component);
}

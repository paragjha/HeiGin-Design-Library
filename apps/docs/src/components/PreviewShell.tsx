import * as React from "react";
import { Check, ChevronDown, Code, Copy, Eye, Maximize, Minimize, Terminal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@heigin/ui";
import { copyText } from "../lib/clipboard";
import { BrandIcon, type Brand } from "./BrandIcons";

export interface InstallOption {
  /** Menu label, e.g. "npm" or "Copy script". */
  label: string;
  command: string;
}

export interface PreviewShellProps {
  title: string;
  /** The live preview. Stays mounted while the Code tab is open so demos keep their state. */
  children: React.ReactNode;
  /** Rendered only while the Code tab is open. */
  code: React.ReactNode;
  /** Called the first time the Code tab opens (lazy-loaded sources). */
  onShowCode?: () => void;
  installs: InstallOption[];
  /** A ready-to-paste instruction for a coding agent. */
  prompt: string;
  /** Shown under the preview, e.g. playground controls. */
  footer?: React.ReactNode;
}

const INSTALL_KEY = "hg-install-option";

const promptTargets: { label: string; brand: Brand; url?: (prompt: string) => string }[] = [
  { label: "Claude Code", brand: "claude" },
  { label: "Codex", brand: "openai" },
  { label: "Cursor", brand: "cursor" },
  { label: "ChatGPT", brand: "openai", url: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}` },
  { label: "Claude", brand: "claude", url: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}` },
  { label: "Lovable", brand: "lovable" },
  { label: "v0", brand: "v0" },
];

const installBrands: Record<string, Brand> = { npm: "npm", pnpm: "pnpm", yarn: "yarn", bun: "bun", "shadcn CLI": "shadcn" };

function InstallIcon({ label }: { label: string }) {
  const brand = installBrands[label];
  return brand ? <BrandIcon name={brand} size={14} /> : <Terminal size={14} strokeWidth={1.8} aria-hidden="true" />;
}

function useFlash(): [string | null, (message: string) => void] {
  const [message, setMessage] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 2000);
    return () => window.clearTimeout(t);
  }, [message]);
  return [message, setMessage];
}

/** Preview / Code switcher with every way to take the component: install command, agent prompt, fullscreen. */
export function PreviewShell({ title, children, code, onShowCode, installs, prompt, footer }: PreviewShellProps) {
  const id = React.useId();
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const [installLabel, setInstallLabel] = React.useState(() => {
    try {
      const saved = window.localStorage.getItem(INSTALL_KEY);
      if (saved && installs.some((i) => i.label === saved)) return saved;
    } catch {
      // Storage can be blocked; the first option is a fine default.
    }
    return installs[0]?.label ?? "";
  });
  const install = installs.find((i) => i.label === installLabel) ?? installs[0];
  const [flash, setFlash] = useFlash();
  const body = React.useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = React.useState(false);

  React.useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === body.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const copy = async (text: string, what: string) => setFlash((await copyText(text)) ? `${what} copied` : "Copy failed");
  const show = (next: "preview" | "code") => {
    if (next === "code") onShowCode?.();
    setTab(next);
  };
  const pickInstall = (label: string) => {
    setInstallLabel(label);
    try {
      window.localStorage.setItem(INSTALL_KEY, label);
    } catch {
      // Not remembered across pages; nothing else depends on it.
    }
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else {
      setTab("preview");
      void body.current?.requestFullscreen();
    }
  };

  return (
    <section className="pv" aria-label={`${title} preview`}>
      <div className="pv__bar">
        <div className="pv__tabs" role="tablist" aria-label="Preview or code">
          <button type="button" role="tab" id={`${id}-t-preview`} aria-selected={tab === "preview"} aria-controls={`${id}-preview`} className="pv__tab" onClick={() => show("preview")}>
            <Eye size={14} strokeWidth={1.8} aria-hidden="true" /> Preview
          </button>
          <button type="button" role="tab" id={`${id}-t-code`} aria-selected={tab === "code"} aria-controls={`${id}-code`} className="pv__tab" onClick={() => show("code")}>
            <Code size={14} strokeWidth={1.8} aria-hidden="true" /> Code
          </button>
        </div>

        <div className="pv__tools">
          {install && (
            <div className="pv__group">
              <button type="button" className="pv__cmd" title={install.command} data-testid="pv-copy-install" onClick={() => copy(install.command, "Install command")}>
                <InstallIcon label={install.label} />
                <code>{install.command}</code>
                {flash === "Install command copied" ? <Check size={14} strokeWidth={1.8} aria-hidden="true" /> : <Copy size={14} strokeWidth={1.8} aria-hidden="true" />}
                <span className="sr-only">Copy install command</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger render={<button type="button" className="pv__icon" aria-label={`Install with: ${install.label}`} data-testid="pv-install-menu" />}>
                  <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {installs.map((option) => (
                    <DropdownMenuItem key={option.label} icon={<InstallIcon label={option.label} />} shortcut={option.label === install.label ? "✓" : undefined} onClick={() => pickInstall(option.label)}>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger render={<button type="button" className="pv__button" data-testid="pv-prompt-menu" />}>
              {flash === "Prompt copied" ? <Check size={14} strokeWidth={1.8} aria-hidden="true" /> : <Copy size={14} strokeWidth={1.8} aria-hidden="true" />}
              <span>{flash === "Prompt copied" ? "Copied" : "Copy prompt"}</span>
              <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {promptTargets.map(({ label, brand, url }) => (
                <DropdownMenuItem
                  key={label}
                  icon={<BrandIcon name={brand} />}
                  shortcut={url ? "↗" : undefined}
                  onClick={() => (url ? window.open(url(prompt), "_blank", "noopener,noreferrer") : copy(prompt, "Prompt"))}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button type="button" className="pv__icon pv__icon--solo" aria-label={fullscreen ? "Exit fullscreen" : "View preview fullscreen"} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize size={14} strokeWidth={1.8} aria-hidden="true" /> : <Maximize size={14} strokeWidth={1.8} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div ref={body} className="pv__body">
        <div role="tabpanel" id={`${id}-preview`} aria-labelledby={`${id}-t-preview`} hidden={tab !== "preview"} className="pv__panel">
          {children}
          {footer}
        </div>
        {tab === "code" && (
          <div role="tabpanel" id={`${id}-code`} aria-labelledby={`${id}-t-code`} className="pv__panel pv__panel--code">
            {code}
          </div>
        )}
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {flash ?? ""}
      </span>
    </section>
  );
}

const withManager = (npm: string, pnpm: string, yarn: string, bun: string): InstallOption[] => [
  { label: "npm", command: npm },
  { label: "pnpm", command: pnpm },
  { label: "yarn", command: yarn },
  { label: "bun", command: bun },
];

/** `npm install x` in each package manager's spelling. */
export const packageInstalls = (pkg: string) => withManager(`npm install ${pkg}`, `pnpm add ${pkg}`, `yarn add ${pkg}`, `bun add ${pkg}`);

/** `shadcn add <url>` in each package manager's spelling. */
export const shadcnInstalls = (url: string) =>
  withManager(`npx shadcn@latest add ${url}`, `pnpm dlx shadcn@latest add ${url}`, `yarn dlx shadcn@latest add ${url}`, `bunx --bun shadcn@latest add ${url}`);

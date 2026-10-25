import { Tab, Tabs, TabsList, TabsPanel } from "@heigin/ui";
import { Callout } from "../components/Callout";
import { Snippet } from "../components/Snippet";

const HOSTED_URL = "https://ui.heigin.com/api/mcp";

const CLIENT_CONFIG = `{
  "mcpServers": {
    "heigin-ui": {
      "command": "npx",
      "args": ["-y", "@heigin/mcp"]
    }
  }
}`;

const REMOTE_CONFIG = `{
  "mcpServers": {
    "heigin-ui": {
      "url": "${HOSTED_URL}"
    }
  }
}`;

const TOOLS: Array<{ name: string; what: string }> = [
  { name: "list_components", what: "Lists every component. Filter by ui, crm or all." },
  { name: "get_component", what: "Full detail for one component: description, props, imports, dependencies and files." },
  { name: "get_tokens", what: "Design tokens, filterable by category (color, space, font, …) or keyword." },
  { name: "search", what: "Free-text search across components, props and tokens, ranked by relevance." },
  { name: "get_setup_guide", what: "Install and setup steps tailored to Next.js, Vite, Remix or a general project." },
  { name: "copy_component_command", what: "The exact command to copy a component and its dependencies into your project." },
];

const RELEASES = [
  { version: "0.1.3", name: "search-stopped-exploding", note: "search no longer crashes when a token has no description." },
  { version: "0.1.2", name: "npm-said-no-so-we-tried-again", note: "Added repository metadata for provenance." },
  { version: "0.1.0", name: "it-works-on-my-machine", note: "First release." },
];

export function McpPage() {
  return (
    <article className="page mcp-page">
      <header className="page__header">
        <h1>MCP Server</h1>
        <p className="lede">
          Use the <code className="inline-code">@heigin/mcp</code> server to let coding agents browse the HeiGin UI component catalog, look up props and tokens,
          and get the right copy-source command, directly from inside the editor.
        </p>
      </header>

      <section aria-labelledby="quick-start-h">
        <h2 id="quick-start-h">Quick start</h2>
        <p>
          Pick your coding agent, add the config to your project, then restart the agent. Prefer the hosted URL for Claude Desktop and web agents, or{" "}
          <code className="inline-code">npx</code> for editors that spawn the server locally.
        </p>

        <Tabs defaultValue="claude-code">
          <TabsList>
            <Tab value="claude-code">Claude Code</Tab>
            <Tab value="cursor">Cursor</Tab>
            <Tab value="vscode">VS Code</Tab>
            <Tab value="claude-desktop">Claude Desktop</Tab>
            <Tab value="hosted">Hosted (remote)</Tab>
          </TabsList>

          <TabsPanel value="claude-code">
            <p>
              Add this to <code className="inline-code">.mcp.json</code> at the root of your project:
            </p>
            <Snippet label=".mcp.json" lang="json" code={CLIENT_CONFIG} />
            <p>
              Restart Claude Code. Run <code className="inline-code">/mcp</code> to confirm the <code className="inline-code">heigin-ui</code> server is
              connected, then try one of the prompts below.
            </p>
          </TabsPanel>

          <TabsPanel value="cursor">
            <p>
              Add this to <code className="inline-code">.cursor/mcp.json</code> in your project:
            </p>
            <Snippet label=".cursor/mcp.json" lang="json" code={CLIENT_CONFIG} />
            <p>
              Open Cursor Settings &rarr; MCP and enable the <code className="inline-code">heigin-ui</code> server. A green dot next to the name means it's
              connected.
            </p>
          </TabsPanel>

          <TabsPanel value="vscode">
            <p>
              Add this to <code className="inline-code">.vscode/mcp.json</code> in your project:
            </p>
            <Snippet label=".vscode/mcp.json" lang="json" code={CLIENT_CONFIG} />
            <p>
              Open the file and click <strong>Start</strong> above the <code className="inline-code">heigin-ui</code> entry. GitHub Copilot Chat picks it up
              automatically.
            </p>
          </TabsPanel>

          <TabsPanel value="claude-desktop">
            <p>
              The easiest way is Settings &rarr; Connectors &rarr; <strong>Add custom connector</strong> and paste the hosted URL:
            </p>
            <Snippet label="MCP server URL" lang="bash" code={HOSTED_URL} />
            <p>Name it something like &ldquo;HeiGin UI&rdquo; and click Continue. The tools show up in the connectors menu.</p>
            <p>
              Or, if you'd rather run it locally, add this to the Claude Desktop config file (<code className="inline-code">~/Library/Application Support/Claude/claude_desktop_config.json</code> on macOS,{" "}
              <code className="inline-code">%APPDATA%\Claude\claude_desktop_config.json</code> on Windows) and restart the app:
            </p>
            <Snippet label="claude_desktop_config.json" lang="json" code={CLIENT_CONFIG} />
          </TabsPanel>

          <TabsPanel value="hosted">
            <p>
              A hosted copy of the MCP server runs at <code className="inline-code">{HOSTED_URL}</code>. Any MCP client that speaks HTTP (Streamable HTTP transport) can connect without installing anything.
            </p>
            <p>
              In an app with a &ldquo;custom connector&rdquo; dialog (like Claude Desktop or Claude on the web), paste the URL directly:
            </p>
            <Snippet label="MCP server URL" lang="bash" code={HOSTED_URL} />
            <p>In a config file, point the server at the URL instead of a command:</p>
            <Snippet label="remote config" lang="json" code={REMOTE_CONFIG} />
            <Callout tone="info" title="Read-only and public">
              The hosted endpoint serves the public component catalog. It takes no auth and holds no secrets, so anyone with the URL can list components and tokens. If you need auth, run the stdio version with <code className="inline-code">npx @heigin/mcp</code> instead.
            </Callout>
          </TabsPanel>
        </Tabs>

        <Callout tone="info" title="Pin a release by name">
          Every release has a name. To pin one, use its npm tag in place of <code className="inline-code">@heigin/mcp</code> — for example{" "}
          <code className="inline-code">@heigin/mcp@search-stopped-exploding</code> in the <code className="inline-code">args</code> array.
        </Callout>
      </section>

      <section aria-labelledby="what-h">
        <h2 id="what-h">What is MCP?</h2>
        <p>
          <a href="https://modelcontextprotocol.io/" target="_blank" rel="noreferrer">
            Model Context Protocol
          </a>{" "}
          is an open standard that lets AI assistants talk to external tools and data over stdio. One config file works in Claude Code, Cursor, VS Code,
          Windsurf and Claude Desktop. With <code className="inline-code">@heigin/mcp</code> connected, your agent can:
        </p>
        <ul className="prose-list">
          <li>
            <strong>Browse the catalog</strong> &mdash; list the 30 primitives and 17 CRM patterns, filter by category.
          </li>
          <li>
            <strong>Look up a component</strong> &mdash; description, props, imports, dependencies and files, straight from the manifest.
          </li>
          <li>
            <strong>Search across everything</strong> &mdash; component names, prop names and design tokens, ranked by relevance.
          </li>
          <li>
            <strong>Install or copy</strong> &mdash; get the exact <code className="inline-code">npm install</code> step or the copy-source command.
          </li>
        </ul>
      </section>

      <section aria-labelledby="how-h">
        <h2 id="how-h">How it works</h2>
        <ol className="prose-list">
          <li>
            <strong>Config.</strong> Your editor reads <code className="inline-code">.mcp.json</code> (or its equivalent) and spawns{" "}
            <code className="inline-code">npx -y @heigin/mcp</code> over stdio.
          </li>
          <li>
            <strong>Bundled data.</strong> The server reads the component manifests, props and tokens that ship inside the npm package &mdash; no network
            calls, no API keys.
          </li>
          <li>
            <strong>Tool calls.</strong> The agent calls one of the tools below. Each returns a short text result, so it stays cheap in context.
          </li>
          <li>
            <strong>Your prompt.</strong> You ask in plain English (&ldquo;add a button and a dialog&rdquo;); the agent picks the right tools and writes the
            code.
          </li>
        </ol>
      </section>

      <section aria-labelledby="tools-h">
        <h2 id="tools-h">Tools</h2>
        <p>The server exposes six tools. Your agent decides which to call based on your prompt.</p>
        <table className="table mcp-table">
          <thead>
            <tr>
              <th scope="col">Tool</th>
              <th scope="col">What it returns</th>
            </tr>
          </thead>
          <tbody>
            {TOOLS.map((t) => (
              <tr key={t.name}>
                <td>
                  <code className="inline-code">{t.name}</code>
                </td>
                <td>{t.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="prompts-h">
        <h2 id="prompts-h">Example prompts</h2>
        <p>Once the server is connected, try one of these in your editor's chat:</p>
        <h3 className="h4">Browse and look up</h3>
        <ul className="prose-list">
          <li>&ldquo;Show me every HeiGin CRM pattern and tell me which ones need <code className="inline-code">use client</code>.&rdquo;</li>
          <li>&ldquo;What props does the Button component take?&rdquo;</li>
          <li>&ldquo;List the HeiGin color tokens and show their CSS variables.&rdquo;</li>
        </ul>
        <h3 className="h4">Build with components</h3>
        <ul className="prose-list">
          <li>&ldquo;Build a lead form page using HeiGin components. Keep imports from <code className="inline-code">@heigin/ui</code>.&rdquo;</li>
          <li>&ldquo;Add a dialog that opens on button click using HeiGin UI.&rdquo;</li>
          <li>&ldquo;Give me the Next.js App Router setup for HeiGin UI.&rdquo;</li>
        </ul>
        <h3 className="h4">Copy the source</h3>
        <ul className="prose-list">
          <li>&ldquo;Copy the HeiGin Button into my project under <code className="inline-code">components/ui</code>.&rdquo;</li>
          <li>&ldquo;What files and packages does the HeiGin Dialog depend on?&rdquo;</li>
        </ul>
      </section>

      <section aria-labelledby="trouble-h">
        <h2 id="trouble-h">Troubleshooting</h2>
        <h3 className="h4">Server shows as not connected</h3>
        <ol className="prose-list">
          <li>Restart your editor after editing the config file.</li>
          <li>Confirm Node 20 or newer is on your PATH &mdash; <code className="inline-code">npx</code> runs the server.</li>
          <li>In Claude Code, run <code className="inline-code">/mcp</code> and look for the <code className="inline-code">heigin-ui</code> entry.</li>
          <li>Clear the <code className="inline-code">npx</code> cache with <code className="inline-code">npx clear-npx-cache</code> and reconnect.</li>
        </ol>
        <h3 className="h4">Agent doesn't call the tools</h3>
        <p>
          Phrase the prompt so it mentions HeiGin or the design system, for example &ldquo;using HeiGin UI&hellip;&rdquo;. Agents only pick MCP tools when the
          request clearly needs them.
        </p>
      </section>

      <section aria-labelledby="releases-h">
        <h2 id="releases-h">Releases</h2>
        <ul className="prose-list">
          {RELEASES.map((r) => (
            <li key={r.version}>
              <strong>v{r.version}</strong> &mdash; <em>{r.name}</em>. {r.note}
            </li>
          ))}
        </ul>
        <p>
          Full history on the{" "}
          <a href="https://github.com/paragjha/HeiGin-Design-Library/releases" target="_blank" rel="noreferrer">
            GitHub releases page
          </a>
          .
        </p>
      </section>
    </article>
  );
}

import { Callout } from "../components/Callout";
import { Snippet } from "../components/Snippet";

const RELEASES = [
  { version: "0.1.3", name: "search-stopped-exploding", note: "Fixes a crash in search when a token has no description." },
  { version: "0.1.2", name: "npm-said-no-so-we-tried-again", note: "Adds repository metadata so npm can verify provenance from GitHub Actions." },
  { version: "0.1.0", name: "it-works-on-my-machine", note: "First release: component catalog, props, tokens, search, setup guide and copy command." },
];

const TOOLS = [
  ["list_components", "Every component, filterable by ui, crm or all."],
  ["get_component", "A component's description, props, imports, dependencies and files."],
  ["get_tokens", "Design tokens, filterable by category or keyword."],
  ["search", "Free-text search across components, props and tokens."],
  ["get_setup_guide", "Install and setup steps for Next.js, Vite, Remix or a general project."],
  ["copy_component_command", "The command that copies a component and its dependencies into your project."],
];

export function McpPage() {
  return (
    <article className="page">
      <header className="page__header">
        <h1>MCP server</h1>
        <p className="lede">
          <code className="inline-code">@heigin/mcp</code> lets coding agents such as Claude Code, Cursor and VS Code Copilot read the HeiGin UI catalog, props,
          tokens and setup steps directly, instead of guessing from the source.
        </p>
      </header>

      <section aria-labelledby="setup-h">
        <h2 id="setup-h">Connect your agent</h2>
        <p>Add the server to your project. The config is the same in every agent. Only the file location changes.</p>
        <Snippet
          label=".mcp.json (Claude Code, VS Code) or .cursor/mcp.json (Cursor)"
          lang="json"
          code={`{
  "mcpServers": {
    "heigin-ui": {
      "command": "npx",
      "args": ["-y", "@heigin/mcp"]
    }
  }
}`}
        />
        <p>
          Claude Desktop reads the same block from <code className="inline-code">claude_desktop_config.json</code> (on Windows:{" "}
          <code className="inline-code">%APPDATA%\Claude\</code>).
        </p>
        <Callout tone="info" title="Pin a release">
          Every release has a name. To pin one, use its npm tag in place of <code className="inline-code">@heigin/mcp</code>, for example{" "}
          <code className="inline-code">npx -y @heigin/mcp@search-stopped-exploding</code>.
        </Callout>
      </section>

      <section aria-labelledby="tools-h">
        <h2 id="tools-h">What the agent can ask</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Tool</th>
              <th scope="col">What it returns</th>
            </tr>
          </thead>
          <tbody>
            {TOOLS.map(([tool, what]) => (
              <tr key={tool}>
                <td>
                  <code className="inline-code">{tool}</code>
                </td>
                <td>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="releases-h">
        <h2 id="releases-h">Release history</h2>
        <ul className="prose-list">
          {RELEASES.map((r) => (
            <li key={r.version}>
              <strong>v{r.version}</strong> — <em>{r.name}</em>. {r.note}
            </li>
          ))}
        </ul>
        <p>
          Every release is also listed on the{" "}
          <a href="https://github.com/paragjha/HeiGin-Design-Library/releases" target="_blank" rel="noreferrer">
            GitHub releases page
          </a>
          .
        </p>
      </section>
    </article>
  );
}

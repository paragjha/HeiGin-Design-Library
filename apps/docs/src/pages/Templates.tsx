import { EmptyState } from "@heigin/ui";
import { PageMeta } from "../components/PageMeta";
import { counts } from "../generated/catalog";

/**
 * Templates index. Reads from counts.templates so the "0 templates" phrasing
 * disappears automatically when source/templates/*.json entries are added
 * via the template productization task.
 */
export function TemplatesPage() {
  const n = counts.templates;
  return (
    <article className="page">
      <PageMeta
        title="Templates"
        description="Full-page and section templates composed from HeiGin UI primitives and CRM patterns. Preview, copy and install via the HeiGin registry."
        ogType="website"
      />
      <header className="page__header">
        <p className="eyebrow">Templates</p>
        <h1>Templates</h1>
        <p className="lede">
          Full-page and section templates composed from HeiGin UI primitives and CRM patterns. Preview, copy and install via the registry.
        </p>
      </header>

      {n === 0 ? (
        <EmptyState
          title="No templates yet"
          description="The full-page and section templates land here once published. The marketing landing page at heigin.com will be the first."
        />
      ) : (
        <p className="muted small">{n} templates. Index landing — individual template pages render at /templates/:slug.</p>
      )}
    </article>
  );
}

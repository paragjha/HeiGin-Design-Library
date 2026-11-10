import * as React from "react";

/**
 * Per-page SEO metadata. Relies on React 19's native support for `<title>`
 * and `<meta>` inside component trees (React hoists them into document.head).
 *
 * Pass `title` and `description`; the rest are inferred from
 * `window.location` and site defaults. For canonical to be meaningful, this
 * must be rendered after the pushState router is in place (#20 landed).
 */

const SITE = "https://ui.heigin.com";
const DEFAULT_OG_IMAGE = `${SITE}/og/default.png`; // Generated per task #28; shared fallback until then.

export interface PageMetaProps {
  /** Page title. Will be suffixed with " · HeiGin UI" unless it already is. */
  title: string;
  /** Meta description. Also used as OG description. */
  description: string;
  /** Path to canonicalize; defaults to current location.pathname. */
  path?: string;
  /** Override the OG image URL. Defaults to the shared /og/default.png. */
  ogImage?: string;
  /** Per-page type; "website" for the homepage, "article" for docs pages. */
  ogType?: "website" | "article";
  /** Raw JSON-LD body to drop into a <script type="application/ld+json">. */
  jsonLd?: object | object[];
}

export function PageMeta({ title, description, path, ogImage = DEFAULT_OG_IMAGE, ogType = "article", jsonLd }: PageMetaProps) {
  const fullTitle = title.endsWith("HeiGin UI") ? title : `${title} · HeiGin UI`;
  const url = `${SITE}${path ?? (typeof window !== "undefined" ? window.location.pathname : "/")}`;
  const ldBodies = jsonLd ? ([] as object[]).concat(jsonLd) : [];

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="HeiGin UI" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {ldBodies.map((body, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(body) }} />
      ))}
    </>
  );
}

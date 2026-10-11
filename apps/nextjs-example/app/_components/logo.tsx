/** HeiGin mark (two offset bars) on the dark brand tile. Decorative: pair it with the visible name. */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false" style={{ flexShrink: 0, display: "block" }}>
      <rect width="64" height="64" rx="14" fill="var(--hg-color-accent)" />
      <g transform="translate(12 12) scale(0.75)" stroke="var(--hg-color-on-accent)" strokeWidth="5.39329">
        <path d="M35.5928 0V35.594" />
        <path d="M17.797 17.797V53.3909" />
      </g>
    </svg>
  );
}

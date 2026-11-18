import { Loader } from "@heigin/ui";

/** Both styles at each size. Agent components take the same choice through their `loader` prop. */
export default function LoaderStyles() {
  const sizes = ["sm", "md", "lg"] as const;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto repeat(3, 64px)", alignItems: "center", gap: "16px 24px", fontSize: 13 }}>
      <span />
      {sizes.map((s) => (
        <span key={s} style={{ color: "var(--hg-color-muted)" }}>
          {s}
        </span>
      ))}
      {(["orb", "spinner"] as const).map((v) => (
        <div key={v} style={{ display: "contents" }}>
          <span>{v === "orb" ? "Thinking orb" : "Spinner"}</span>
          {sizes.map((s) => (
            <Loader key={s} variant={v} size={s} label={`Loading (${v}, ${s})`} />
          ))}
        </div>
      ))}
    </div>
  );
}

import * as React from "react";
import { Input, Select, Switch } from "@heigin/ui";
import { CodeBlock } from "./CodeBlock";
import { CopyButton } from "./CopyButton";
export type Control =
  | { type: "select"; label: string; options: readonly string[]; default: string }
  | { type: "boolean"; label: string; default: boolean }
  | { type: "text"; label: string; default: string };

export type ControlValues<C extends Record<string, Control>> = {
  [K in keyof C]: C[K] extends { type: "boolean" } ? boolean : string;
};

export interface PlaygroundDef<C extends Record<string, Control> = Record<string, Control>> {
  controls: C;
  render: (values: ControlValues<C>) => React.ReactNode;
  /** JSX snippet for the current values. Must use the same public API as `render`. */
  code: (values: ControlValues<C>) => string;
}

export function definePlayground<C extends Record<string, Control>>(def: PlaygroundDef<C>): PlaygroundDef {
  return def as unknown as PlaygroundDef;
}

function defaults(controls: Record<string, Control>) {
  return Object.fromEntries(Object.entries(controls).map(([k, c]) => [k, c.default])) as Record<string, string | boolean>;
}

/** Live preview of a real component with variant/size/state controls and the matching snippet. */
export function Playground({ def, title }: { def: PlaygroundDef; title: string }) {
  const [values, setValues] = React.useState(() => defaults(def.controls));
  const [resetKey, setResetKey] = React.useState(0);
  const set = (key: string, value: string | boolean) => setValues((v) => ({ ...v, [key]: value }));
  const code = def.code(values as never);

  return (
    <section className="playground" aria-label={`${title} playground`}>
      <div className="playground__stage" data-testid="playground-stage">
        <React.Fragment key={resetKey}>{def.render(values as never)}</React.Fragment>
      </div>
      <div className="playground__controls" role="group" aria-label="Playground controls">
        {Object.entries(def.controls).map(([key, control]) => {
          const id = `pg-${key}`;
          if (control.type === "boolean")
            return (
              <Switch
                key={key}
                label={control.label}
                checked={Boolean(values[key])}
                onCheckedChange={(checked) => set(key, checked)}
                data-testid={id}
              />
            );
          if (control.type === "select")
            return (
              <label key={key} className="control" htmlFor={id}>
                <span>{control.label}</span>
                <Select
                  id={id}
                  size="sm"
                  value={String(values[key])}
                  onValueChange={(v) => v && set(key, v)}
                  options={control.options.map((o) => ({ value: o, label: o }))}
                />
              </label>
            );
          return (
            <label key={key} className="control" htmlFor={id}>
              <span>{control.label}</span>
              <Input id={id} size="sm" value={String(values[key])} onChange={(e) => set(key, e.target.value)} />
            </label>
          );
        })}
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setValues(defaults(def.controls));
            setResetKey((k) => k + 1);
          }}
        >
          Reset
        </button>
      </div>
      <div className="playground__code">
        <div className="code-panel__head">
          <span className="muted small">Snippet for the current settings</span>
          <CopyButton text={code} label="Copy snippet" testId="copy-snippet" variant="ghost" />
        </div>
        <CodeBlock code={code} label="Playground snippet" />
      </div>
    </section>
  );
}

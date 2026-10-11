import * as React from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button, IconButton, Input, NativeSelect } from "@heigin/ui";
import type { FieldDef } from "./blocks";
import { ICONS, ICON_NAMES } from "./data";

/** Icon column: a preview next to a picker of the Lucide icons the docs and code generator know. */
function IconCell({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const Icon = ICONS[value];
  const names = ICON_NAMES.filter((n) => n !== "none");
  return (
    <div className="b-list__icon">
      <span className="b-list__icon-preview" aria-hidden="true">
        {Icon ? <Icon strokeWidth={1.6} /> : null}
      </span>
      <NativeSelect size="sm" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">No icon</option>
        {value && !ICONS[value] && <option value={value}>{value} (unknown)</option>}
        {names.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

/**
 * Row-by-row editor for list-style props. The value is stored as one line per row with columns
 * joined by the separator (" | " by default), so blocks and code generation stay unchanged.
 */
export function ListEditor({ def, value, onChange }: { def: FieldDef; value: string; onChange: (v: string) => void }) {
  const columns = def.columns ?? [{ key: "value", label: "Value" }];
  const sep = def.separator ?? " | ";
  const splitOn = sep.trim();
  // Blank rows are kept while editing (clearing a cell must not delete its row); blocks ignore them.
  const rows = (value === "" ? [] : value.split("\n")).map((l) => {
      if (columns.length === 1) return [l.trim()];
      const parts = l.split(splitOn).map((p) => p.trim());
      // The last column keeps any extra separators (e.g. "Value: 10:30").
      return columns.map((_, i) => (i === columns.length - 1 ? parts.slice(i).join(` ${splitOn} `).trim() : (parts[i] ?? "")));
  });
  const groupId = React.useId();

  const commit = (next: string[][]) =>
    onChange(
      next
        .map((r) => (columns.length === 1 ? (r[0] ?? "") : r.join(sep)))
        .join("\n"),
    );
  const setCell = (ri: number, ci: number, v: string) => commit(rows.map((r, i) => (i === ri ? r.map((c, j) => (j === ci ? v.replace(/\n/g, " ") : c)) : r)));
  const move = (ri: number, d: -1 | 1) => {
    const t = ri + d;
    if (t < 0 || t >= rows.length) return;
    const next = [...rows];
    [next[ri], next[t]] = [next[t]!, next[ri]!];
    commit(next);
  };

  return (
    <fieldset className="b-list" aria-labelledby={`${groupId}-legend`}>
      <legend id={`${groupId}-legend`} className="b-list__legend">
        {def.label}
      </legend>
      {rows.length === 0 && <p className="muted tiny">No rows yet.</p>}
      <ol className="b-list__rows">
        {rows.map((row, ri) => (
          <li key={ri} className={`b-list__row${columns.length === 1 ? " b-list__row--single" : ""}`} data-testid={`list-row-${ri}`}>
            <div className="b-list__cells">
              {columns.map((col, ci) =>
                col.kind === "icon" ? (
                  <IconCell key={col.key} label={`${col.label}, row ${ri + 1}`} value={row[ci] ?? ""} onChange={(v) => setCell(ri, ci, v)} />
                ) : (
                  <Input
                    key={col.key}
                    size="sm"
                    aria-label={`${col.label}, row ${ri + 1}`}
                    placeholder={col.placeholder ?? col.label}
                    value={row[ci] ?? ""}
                    onChange={(e) => setCell(ri, ci, e.target.value)}
                  />
                ),
              )}
            </div>
            <div className="b-list__row-actions">
              <IconButton label={`Move row ${ri + 1} up`} icon={<ArrowUp strokeWidth={1.6} />} size="sm" touch={false} disabled={ri === 0} onClick={() => move(ri, -1)} />
              <IconButton
                label={`Move row ${ri + 1} down`}
                icon={<ArrowDown strokeWidth={1.6} />}
                size="sm"
                touch={false}
                disabled={ri === rows.length - 1}
                onClick={() => move(ri, 1)}
              />
              <IconButton label={`Remove row ${ri + 1}`} icon={<X strokeWidth={1.6} />} size="sm" touch={false} onClick={() => commit(rows.filter((_, i) => i !== ri))} />
            </div>
          </li>
        ))}
      </ol>
      <Button
        size="sm"
        touch={false}
        variant="secondary"
        leadingIcon={<Plus strokeWidth={1.6} />}
        onClick={() => commit([...rows, columns.map((c, i) => (i === 0 ? `New ${c.label.toLowerCase()}` : ""))])}
      >
        Add row
      </Button>
    </fieldset>
  );
}

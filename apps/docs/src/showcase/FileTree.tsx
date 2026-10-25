import * as React from "react";

export interface FileTreeNode {
  /** Stable id, used for selection and expansion state. */
  id: string;
  name: string;
  /** Omit for files. Any array (even empty) means folder. */
  children?: FileTreeNode[];
}

export interface FileTreeProps {
  nodes: FileTreeNode[];
  /** Initially expanded folder ids. */
  defaultExpanded?: string[];
  /** Initially selected file id. */
  defaultSelected?: string;
  /** Fires when the user picks a file (not a folder). */
  onSelect?: (id: string) => void;
}

const FolderIcon = ({ open }: { open: boolean }) => (
  <svg className="hg-filetree__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {open ? (
      <path d="M2.5 5.5h3l1-1.5h5a1 1 0 0 1 1 1V7H2.5zM2.5 7h11l-.9 4.5a1 1 0 0 1-1 .8H3.4a1 1 0 0 1-1-.8z" />
    ) : (
      <path d="M2.5 5.5a1 1 0 0 1 1-1h2.1l1 1.5h5.9a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z" />
    )}
  </svg>
);

const FileIcon = () => (
  <svg className="hg-filetree__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M4 2.5h5.5L13 6v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" />
    <path d="M9.5 2.5V6H13" />
  </svg>
);

const Chevron = () => (
  <svg className="hg-filetree__chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M6 4l4 4-4 4" />
  </svg>
);

/** Keyboard-operable file tree with controlled selection and expansion. */
export function FileTree({ nodes, defaultExpanded = [], defaultSelected, onSelect }: FileTreeProps) {
  const [expanded, setExpanded] = React.useState(() => new Set(defaultExpanded));
  const [selected, setSelected] = React.useState<string | undefined>(defaultSelected);

  const toggle = React.useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const pick = React.useCallback(
    (id: string) => {
      setSelected(id);
      onSelect?.(id);
    },
    [onSelect],
  );

  return (
    <div className="hg-filetree" role="tree" aria-label="File tree">
      <List nodes={nodes} expanded={expanded} selected={selected} onToggle={toggle} onPick={pick} />
    </div>
  );
}

interface ListProps {
  nodes: FileTreeNode[];
  expanded: Set<string>;
  selected?: string;
  onToggle: (id: string) => void;
  onPick: (id: string) => void;
  nested?: boolean;
}

function List({ nodes, expanded, selected, onToggle, onPick, nested = false }: ListProps) {
  return (
    <ul
      className={["hg-filetree__list", nested ? "hg-filetree__list--nested" : ""].filter(Boolean).join(" ")}
      role={nested ? "group" : undefined}
    >
      {nodes.map((node) => {
        const isFolder = Array.isArray(node.children);
        const open = expanded.has(node.id);
        const isSelected = selected === node.id;
        return (
          <li key={node.id} role="treeitem" aria-expanded={isFolder ? open : undefined} aria-selected={isSelected}>
            <button
              type="button"
              className="hg-filetree__row"
              data-selected={isSelected || undefined}
              aria-expanded={isFolder ? open : undefined}
              onClick={() => {
                if (isFolder) onToggle(node.id);
                else onPick(node.id);
              }}
              onKeyDown={(e) => {
                if (!isFolder) return;
                if (e.key === "ArrowRight" && !open) onToggle(node.id);
                else if (e.key === "ArrowLeft" && open) onToggle(node.id);
              }}
            >
              {isFolder ? <Chevron /> : <span style={{ width: 10, flexShrink: 0 }} />}
              {isFolder ? <FolderIcon open={open} /> : <FileIcon />}
              <span>{node.name}</span>
            </button>
            {isFolder && open && node.children && node.children.length > 0 && (
              <List
                nodes={node.children}
                expanded={expanded}
                selected={selected}
                onToggle={onToggle}
                onPick={onPick}
                nested
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

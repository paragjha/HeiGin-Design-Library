// Browser persistence for the builder: named designs, saved blocks ("My blocks") and share links.
// Everything is per-browser (localStorage); share links carry the whole design in the URL.
import { BLOCK_MAP } from "./blocks";
import { cloneWithNewIds, type BuilderDoc, type BuilderNode } from "./model";

const DESIGNS_KEY = "hg-builder-designs-v1";
const BLOCKS_KEY = "hg-builder-my-blocks-v1";

export interface SavedDesign {
  id: string;
  title: string;
  updatedAt: number;
  doc: BuilderDoc;
}
export interface SavedBlock {
  id: string;
  name: string;
  createdAt: number;
  node: BuilderNode;
}

function read<T>(key: string): T[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown;
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}
function write<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function isValidNode(n: unknown): n is BuilderNode {
  const x = n as BuilderNode;
  return !!x && typeof x.id === "string" && BLOCK_MAP.has(x.type) && typeof x.props === "object" && Array.isArray(x.children) && x.children.every(isValidNode);
}
export function isValidDoc(d: unknown): d is BuilderDoc {
  const x = d as BuilderDoc;
  return !!x && typeof x.name === "string" && ["page", "section", "component"].includes(x.mode) && isValidNode(x.root);
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// ── designs
export const listDesigns = () => read<SavedDesign>(DESIGNS_KEY).filter((d) => isValidDoc(d.doc)).sort((a, b) => b.updatedAt - a.updatedAt);
export function saveDesign(doc: BuilderDoc, title: string, id?: string): SavedDesign {
  const all = read<SavedDesign>(DESIGNS_KEY);
  const design: SavedDesign = { id: id ?? newId(), title: title.trim() || doc.name, updatedAt: Date.now(), doc };
  write(DESIGNS_KEY, [design, ...all.filter((d) => d.id !== design.id)]);
  return design;
}
export const deleteDesign = (id: string) => write(DESIGNS_KEY, read<SavedDesign>(DESIGNS_KEY).filter((d) => d.id !== id));

// ── my blocks
export const listBlocks = () => read<SavedBlock>(BLOCKS_KEY).filter((b) => isValidNode(b.node));
export function saveBlock(n: BuilderNode, name: string): SavedBlock {
  const block: SavedBlock = { id: newId(), name: name.trim() || "My block", createdAt: Date.now(), node: n };
  write(BLOCKS_KEY, [...read<SavedBlock>(BLOCKS_KEY), block]);
  return block;
}
export const deleteBlock = (id: string) => write(BLOCKS_KEY, read<SavedBlock>(BLOCKS_KEY).filter((b) => b.id !== id));
/** A fresh copy (new ids) of a saved block, ready to insert. */
export const instantiateBlock = (b: SavedBlock) => cloneWithNewIds(b.node);

// ── share links: deflate + base64url in the hash (#/builder?d=...)
const b64url = (bytes: Uint8Array) => {
  let bin = "";
  bytes.forEach((x) => (bin += String.fromCharCode(x)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function encodeShare(doc: BuilderDoc): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(doc));
  if (typeof CompressionStream === "undefined") return `j.${b64url(json)}`;
  return `z.${b64url(await pipe(json, new CompressionStream("deflate-raw")))}`;
}
export async function decodeShare(token: string): Promise<BuilderDoc | null> {
  try {
    const [kind, data] = [token.slice(0, 1), token.slice(2)];
    const bytes = unb64url(data);
    const json = kind === "z" ? await pipe(bytes, new DecompressionStream("deflate-raw")) : bytes;
    const doc = JSON.parse(new TextDecoder().decode(json)) as unknown;
    return isValidDoc(doc) ? doc : null;
  } catch {
    return null;
  }
}
export const shareUrl = (token: string) => `${location.origin}${location.pathname}#/builder?d=${token}`;
export const shareTokenFromHash = () => new URLSearchParams(location.hash.split("?")[1] ?? "").get("d");

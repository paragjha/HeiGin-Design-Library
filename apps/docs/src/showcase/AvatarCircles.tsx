import * as React from "react";
import { Avatar } from "@heigin/ui";

export interface AvatarCirclesPerson {
  /** Display name. Shown on hover and used for the fallback initials. */
  name: string;
  /** Image URL. Falls back to initials if missing or if the image fails to load. */
  imageUrl?: string;
  /** Optional link for the avatar. */
  profileUrl?: string;
}

export interface AvatarCirclesProps {
  people: AvatarCirclesPerson[];
  /** Maximum visible avatars before the overflow count. Default: 4. */
  max?: number;
  /** Total count override; if omitted, falls back to people.length. */
  numPeople?: number;
  /** Avatar size. Default: md. */
  size?: "sm" | "md" | "lg";
  /** Accessible label for the whole group. */
  label?: string;
}

/** Stack of circular avatars with a trailing overflow count. */
export function AvatarCircles({
  people,
  max = 4,
  numPeople,
  size = "md",
  label,
}: AvatarCirclesProps) {
  const visible = people.slice(0, max);
  const total = numPeople ?? people.length;
  const overflow = Math.max(0, total - visible.length);
  const groupLabel = label ?? `${total} ${total === 1 ? "person" : "people"}`;
  const diameter = size === "sm" ? 24 : size === "lg" ? 48 : 36;

  return (
    <div
      className="hg-avatar-circles"
      role="group"
      aria-label={groupLabel}
      style={{ ["--avatar-ring" as string]: size === "sm" ? "1.5px" : "2px" }}
    >
      {visible.map((p) => {
        const content = (
          <Avatar name={p.name} src={p.imageUrl} size={size} decorative aria-hidden="true" />
        );
        return (
          <React.Fragment key={(p.profileUrl ?? "") + p.name}>
            {p.profileUrl ? (
              <a
                className="hg-avatar-circles__slot"
                href={p.profileUrl}
                target="_blank"
                rel="noreferrer"
                title={p.name}
              >
                {content}
              </a>
            ) : (
              <span className="hg-avatar-circles__slot" title={p.name}>
                {content}
              </span>
            )}
          </React.Fragment>
        );
      })}
      {overflow > 0 && (
        <span
          className="hg-avatar-circles__count"
          aria-label={`${overflow} more`}
          style={{
            width: diameter,
            height: diameter,
            fontSize: size === "sm" ? 10 : size === "lg" ? 14 : 12,
          }}
        >
          +{overflow > 99 ? "99" : overflow}
        </span>
      )}
    </div>
  );
}

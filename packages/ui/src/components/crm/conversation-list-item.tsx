import * as React from "react";
import { cn } from "../../lib/cn";
import { VisuallyHidden } from "../ui/visually-hidden";
import { Avatar } from "../ui/avatar";
import { ChannelMark, type Channel } from "./channel-mark";
import styles from "./crm.module.css";

export interface ConversationListItemProps {
  name: string;
  /** Last message preview (plain text; truncated to one line). */
  preview: string;
  channel: Channel;
  /** Display time, e.g. "10:42 am". */
  timeLabel: string;
  dateTime: string;
  unreadCount?: number;
  selected?: boolean;
  /** Link to the thread. The whole row is clickable via a stretched link. */
  href: string;
  /** Extra trailing content, e.g. an SLAClock. */
  aside?: React.ReactNode;
  avatarSrc?: string;
  /** Extra props for the row link (e.g. onClick for in-app selection, data attributes). */
  linkProps?: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">;
  className?: string;
}

/** One thread in the inbox list. Use inside a <ul>. Server-component safe. */
export function ConversationListItem({
  name,
  preview,
  channel,
  timeLabel,
  dateTime,
  unreadCount = 0,
  selected = false,
  href,
  aside,
  avatarSrc,
  linkProps,
  className,
}: ConversationListItemProps) {
  const unread = unreadCount > 0;
  return (
    <li className={cn(styles.row, styles.rowInteractive, selected && styles.rowSelected, unread && styles.unread, className)}>
      <Avatar name={name} src={avatarSrc} decorative />
      <div className={styles.rowMain}>
        <a {...linkProps} href={href} className={styles.rowTitle} aria-current={selected ? "true" : undefined}>
          {name}
          {unread && <VisuallyHidden>, {unreadCount} unread</VisuallyHidden>}
        </a>
        <div className={styles.rowMeta}>{preview}</div>
        <div style={{ marginTop: 4 }}>
          <ChannelMark channel={channel} />
        </div>
      </div>
      <div className={styles.rowAside}>
        <time dateTime={dateTime}>{timeLabel}</time>
        {unread && <span className={styles.unreadDot} aria-hidden="true" />}
        {aside}
      </div>
    </li>
  );
}

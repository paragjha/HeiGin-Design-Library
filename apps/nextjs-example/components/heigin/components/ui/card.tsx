import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./card.module.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Inner padding. `none` lets tables and lists run edge to edge. */
  padding?: "none" | "sm" | "md" | "lg";
  /** Adds a hover shadow; use when the whole card is a link or button. */
  interactive?: boolean;
  as?: "div" | "section" | "article" | "li";
}

/** White surface with hairline border and card shadow. Server-component safe. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { padding = "md", interactive = false, as = "div", className, ...props },
  ref,
) {
  // Polymorphic element; all allowed tags share the HTMLElement attribute surface we use.
  const Tag = as as "div";
  return (
    <Tag
      ref={ref}
      className={cn(styles.card, styles[`p-${padding}`], interactive && styles.interactive, className)}
      {...props}
    />
  );
});

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned actions (buttons, menus). */
  actions?: React.ReactNode;
  /** Heading level for the title. Default 3. */
  level?: 2 | 3 | 4;
}

export function CardHeader({ title, description, actions, level = 3, className, ...props }: CardHeaderProps) {
  const Heading = `h${level}` as const;
  return (
    <div className={cn(styles.header, className)} {...props}>
      <div className={styles.headings}>
        <Heading className={styles.title}>{title}</Heading>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

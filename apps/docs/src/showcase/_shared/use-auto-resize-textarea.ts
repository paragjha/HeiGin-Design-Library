import { useCallback, useEffect, useRef } from "react";

export interface UseAutoResizeTextareaOptions {
  minHeight?: number;
  maxHeight?: number;
}

/**
 * Grows and shrinks a textarea to fit its content, within the given bounds.
 * `adjustHeight(true)` resets to `minHeight`, used after clearing the value.
 */
export function useAutoResizeTextarea({ minHeight = 48, maxHeight }: UseAutoResizeTextareaOptions = {}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset = false) => {
      const el = textareaRef.current;
      if (!el) return;
      if (reset) {
        el.style.height = `${minHeight}px`;
        return;
      }
      el.style.height = "0px";
      const next = Math.max(minHeight, el.scrollHeight);
      el.style.height = `${maxHeight ? Math.min(maxHeight, next) : next}px`;
    },
    [minHeight, maxHeight],
  );
  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);
  return { textareaRef, adjustHeight };
}

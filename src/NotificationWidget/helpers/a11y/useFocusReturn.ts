import { useCallback, useEffect, useRef, type RefObject } from "react";

export function useFocusReturn(containerRef: RefObject<HTMLElement>) {
  const lastOutsideFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        !containerRef.current?.contains(target)
      ) {
        lastOutsideFocusRef.current = target;
      }
    };

    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [containerRef]);

  return useCallback(
    (id: string) => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return;

      const item = containerRef.current?.querySelector<HTMLElement>(
        `[data-notification-id="${CSS.escape(id)}"]`,
      );
      if (!item || !item.contains(active)) return;

      const previous = lastOutsideFocusRef.current;
      if (previous?.isConnected) {
        previous.focus({ preventScroll: true });
      } else {
        active.blur();
      }
    },
    [containerRef],
  );
}

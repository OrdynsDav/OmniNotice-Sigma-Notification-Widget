import { useCallback, useEffect } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { KeyboardCloseSettings } from "../../types";

export function useKeyboardClose(
  { key, scope }: KeyboardCloseSettings,
  onClose: () => void,
) {
  useEffect(() => {
    if (scope !== "global" || !key) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== key) return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, key, scope]);

  return useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (scope !== "focused" || !key || event.key !== key) return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    },
    [onClose, key, scope],
  );
}

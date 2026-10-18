import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { NotificationListItem } from "../types";
import { createId } from "../helpers/createId";
import { NotificationActions, NotificationActionsContext, NotificationState, NotificationStateContext, ResolvedSettings } from "../context/NotificationContext";
import notificationSettings from "../config/notification.config";
import NotificationWidget from "../Widget/NotificationWidget";

interface NotificationProviderProps {
  children: ReactNode;
  maxVisible?: number;
  removalAnimationMs?: number;
  settings?: Partial<ResolvedSettings>;
}

export function NotificationProvider({
  children,
  maxVisible,
  removalAnimationMs,
  settings,
}: NotificationProviderProps) {
  const resolvedSettings = useMemo<ResolvedSettings>(
    () => ({
      ...notificationSettings,
      ...settings,
      ...(removalAnimationMs !== undefined && { removalAnimationMs }),
    }),
    [settings, removalAnimationMs],
  );
  const visibleLimit = maxVisible ?? resolvedSettings.maxVisible;
  const defaultRemovalMs = resolvedSettings.removalAnimationMs;
 
  const [items, setItems] = useState<NotificationListItem[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
 
  const itemsRef = useRef<NotificationListItem[]>([]);
  itemsRef.current = items;
 
  // Синхронный источник правды о том, что уже поставлено на удаление
  const removingIdsRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Set<number>>(new Set());
 
  // Последний сфокусированный элемент вне виджета: туда вернём фокус при закрытии
  const lastOutsideFocusRef = useRef<HTMLElement | null>(null);
 
  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        !target.closest(".notification-widget")
      ) {
        lastOutsideFocusRef.current = target;
      }
    };
 
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);
 
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);
 
  // Если фокус внутри удаляемой карточки, возвращаем его ДО установки aria-hidden
  const releaseFocus = useCallback((id: string) => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
 
    const item = document.querySelector<HTMLElement>(
      `.notification-widget [data-notification-id="${CSS.escape(id)}"]`,
    );
    if (!item || !item.contains(active)) return;
 
    const previous = lastOutsideFocusRef.current;
    if (previous && previous.isConnected) {
      previous.focus({ preventScroll: true });
    } else {
      active.blur();
    }
  }, []);
 
  const remove = useCallback(
    (id: string) => {
      if (removingIdsRef.current.has(id)) return;
      removingIdsRef.current.add(id);
 
      releaseFocus(id);
 
      setRemovingIds((prev) => new Set(prev).add(id));
 
      // Длительность анимации: настройка самого уведомления или глобальная
      const duration =
        itemsRef.current.find((item) => item.id === id)?.settings
          ?.removalAnimationMs ?? defaultRemovalMs;
 
      const timer = window.setTimeout(() => {
        timersRef.current.delete(timer);
        removingIdsRef.current.delete(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, duration);
      timersRef.current.add(timer);
    },
    [defaultRemovalMs, releaseFocus],
  );
 
  const add = useCallback<NotificationActions["add"]>(
    ({ id: customId, ...notification }) => {
      const id = customId || createId();
      const newItem: NotificationListItem = {
        ...notification,
        id,
        onClose: () => remove(id),
      };
 
      // Чтобы remove сразу после add видел настройки нового элемента
      itemsRef.current = [newItem, ...itemsRef.current];
      setItems((prev) => [newItem, ...prev]);
      return id;
    },
    [remove],
  );
 
  const update = useCallback<NotificationActions["update"]>((id, patch) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
              id,
              // settings сливаем, а не затираем целиком
              settings: patch.settings
                ? { ...item.settings, ...patch.settings }
                : item.settings,
              // закрытие всегда идёт через remove
              onClose: item.onClose,
            }
          : item,
      ),
    );
  }, []);
 
  const clear = useCallback(() => {
    itemsRef.current.forEach((item) => remove(item.id));
  }, [remove]);
 
  // Лимит видимых: лишние (самые старые) закрываем
  useEffect(() => {
    const activeItems = items.filter(
      (item) => !removingIdsRef.current.has(item.id),
    );
 
    if (activeItems.length > visibleLimit) {
      activeItems.slice(visibleLimit).forEach((item) => remove(item.id));
    }
  }, [items, visibleLimit, remove]);
 
  const actions = useMemo<NotificationActions>(
    () => ({ add, update, remove, clear }),
    [add, update, remove, clear],
  );
 
  const state = useMemo<NotificationState>(
    () => ({ items, removingIds, settings: resolvedSettings }),
    [items, removingIds, resolvedSettings],
  );
 
  return (
    <NotificationActionsContext.Provider value={actions}>
      <NotificationStateContext.Provider value={state}>
        {children}
        <NotificationWidget />
      </NotificationStateContext.Provider>
    </NotificationActionsContext.Provider>
  );
}
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./NotificationWidget.css";
import type {
  NotificationWidgetHandle,
  NotificationWidgetProps,
  NotificationListItem,
} from "../types";
import NotificationCard from "../NotificationCard/NotificationCard";
import { createId } from "../helpers/createId";
import notificationSettings from "../notification.config";

const NotificationWidget = forwardRef<
  NotificationWidgetHandle,
  NotificationWidgetProps
>(function NotificationWidget(
  { maxVisible, removalAnimationMs, settings },
  ref,
) {
  const resolvedSettings = { ...notificationSettings, ...settings };
  const visibleLimit = maxVisible ?? resolvedSettings.maxVisible;
  const animationDuration =
    removalAnimationMs ?? resolvedSettings.removalAnimationMs;
  const [items, setItems] = useState<NotificationListItem[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Map<string, DOMRect>>(new Map());

  // Синхронный источник правды о том, что уже поставлено на удаление,
  // нужен, чтобы не запланировать повторный таймер для одного и того же id
  // при частых быстрых добавлениях.
  const removingIdsRef = useRef<Set<string>>(new Set());

  const removeItem = useCallback(
    (id: string) => {
      if (removingIdsRef.current.has(id)) return;
      removingIdsRef.current.add(id);

      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      window.setTimeout(() => {
        removingIdsRef.current.delete(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, animationDuration);
    },
    [animationDuration],
  );

  useImperativeHandle(
    ref,
    () => ({
      add: ({ id: customId, ...notification }) => {
        const id = customId || createId();
        const newItem: NotificationListItem = {
          ...notification,
          id,
          onClose: () => removeItem(id),
        };

        setItems((prev) => [newItem, ...prev]);
        return id;
      },
      remove: removeItem,
    }),
    [removeItem],
  );

  useEffect(() => {
    const activeItems = items.filter(
      (item) => !removingIdsRef.current.has(item.id),
    );

    if (activeItems.length > visibleLimit) {
      const excess = activeItems.slice(visibleLimit);
      excess.forEach((item) => removeItem(item.id));
    }
  }, [items, visibleLimit, removeItem]);

  // FLIP-анимация: при изменении списка карточки плавно "доезжают"
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const newPositions = new Map<string, DOMRect>();
    const children = Array.from(
      container.querySelectorAll<HTMLElement>("[data-notification-id]"),
    );

    children.forEach((child) => {
      const id = child.dataset.notificationId as string;
      newPositions.set(id, child.getBoundingClientRect());
    });

    children.forEach((child) => {
      const id = child.dataset.notificationId as string;
      const oldRect = positionsRef.current.get(id);
      const newRect = newPositions.get(id);
      if (!oldRect || !newRect) return;

      const deltaY = oldRect.top - newRect.top;
      if (deltaY === 0) return;

      child.style.transition = "none";
      child.style.transform = `translateY(${deltaY}px)`;

      requestAnimationFrame(() => {
        child.style.transition = "";
        child.style.transform = "";
      });
    });

    positionsRef.current = newPositions;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="notification-widget"
      role="region"
      aria-label="Уведомления"
    >
      {items.map((item) => (
        <div
          key={item.id}
          data-notification-id={item.id}
          aria-hidden={removingIds.has(item.id) || undefined}
          aria-live="polite"
          aria-relevant="additions"
          className={
            "notification-widget__item" +
            (removingIds.has(item.id)
              ? " notification-widget__item--removing"
              : "")
          }
        >
          <NotificationCard {...item} settings={resolvedSettings} />
        </div>
      ))}
    </div>
  );
});

export default NotificationWidget;

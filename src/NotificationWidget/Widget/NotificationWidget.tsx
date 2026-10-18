import { useLayoutEffect, useRef, type CSSProperties } from "react";
import NotificationCard from "../NotificationCard/NotificationCard";
import { useNotificationState } from "../context/NotificationContext";
import type {
  NotificationItemOverrides,
  NotificationSettings,
} from "../types";
import "./NotificationWidget.css";
import { omni } from "../helpers/omni";

/** Глобальный конфиг + настройки уведомления; undefined в override игнорируются */
function resolveItemSettings(
  base: NotificationSettings,
  override?: NotificationItemOverrides,
): NotificationSettings {
  if (!override) return base;

  const result = { ...base } as NotificationSettings & Record<string, unknown>;

  const { closeKeyboard, ...rest } = override;

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value;
    }
  });

  if (closeKeyboard) {
    result.closeKeyboard = {
      ...base.closeKeyboard,
      ...Object.fromEntries(
        Object.entries(closeKeyboard).filter(([, value]) => value !== undefined),
      ),
    };
  }

  return result;
}

/**
 * Только отображение. Всё управление (add/update/remove/clear)
 * живёт в NotificationProvider и доступно через useNotification().
 */
export default function NotificationWidget() {
  const { items, removingIds, settings } = useNotificationState();

  const containerRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Map<string, DOMRect>>(new Map());

  // FLIP-анимация: при изменении списка карточки плавно "доезжают"
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      positionsRef.current = new Map();
      return;
    }

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
      className={omni("notification-widget")}
      role="region"
      aria-label="Уведомления"
    >
      {items.map((item) => {
        const itemSettings = resolveItemSettings(settings, item.settings);
        const isRemoving = removingIds.has(item.id);

        return (
          <div
            key={item.id}
            data-notification-id={item.id}
            aria-hidden={isRemoving || undefined}
            className={omni(
              "notification-widget__item",
              isRemoving && "notification-widget__item--removing",
            )}
            style={
              {
                "--omni-nfl-exit-duration": `${itemSettings.removalAnimationMs}ms`,
              } as CSSProperties
            }
          >
            <NotificationCard {...item} settings={itemSettings} />
          </div>
        );
      })}
    </div>
  );
}
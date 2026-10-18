import { useLayoutEffect, useRef, type CSSProperties } from "react";
import NotificationCard from "../NotificationCard/NotificationCard";
import { useNotificationState } from "../context/NotificationContext";
import "./NotificationWidget.css";
import { omni } from "../helpers/omni";
import { resolveItemSettings } from "../helpers/resolveItemSettings";
import { animateNotificationFlip } from "../helpers/animateNotificationFlip";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Только отображение. Всё управление (add/update/remove/clear)
 * живёт в NotificationProvider и доступно через useNotification().
 */
export default function NotificationWidget() {
  const { items, removingIds, settings } = useNotificationState();

  const containerRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Map<string, DOMRect>>(new Map());

  useLayoutEffect(() => {
    positionsRef.current = animateNotificationFlip(
      containerRef.current,
      positionsRef.current,
    );
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
            <ErrorBoundary
              resetKeys={[item]}
              fallbackRender={() => null}
              onError={(error, info) => {
                console.error(
                  `Notification "${item.id}" crashed.`,
                  error,
                  info.componentStack,
                );
              }}
            >
              <NotificationCard {...item} settings={itemSettings} />
            </ErrorBoundary>
          </div>
        );
      })}
    </div>
  );
}

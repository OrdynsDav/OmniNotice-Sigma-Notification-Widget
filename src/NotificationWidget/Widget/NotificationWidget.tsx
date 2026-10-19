import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";
import NotificationCard from "../NotificationCard/NotificationCard";
import { useNotificationState } from "../context/NotificationContext";
import { omni } from "../helpers/omni";
import { resolveItemSettings } from "../helpers/resolveItemSettings";
import { animateNotificationFlip } from "../helpers/animateNotificationFlip";
import { ErrorBoundary } from "react-error-boundary";
import { useAlertAnnouncements } from "../helpers/a11y/useAlertAnnouncements";
import "./NotificationWidget.css";

/**
 * Только отображение. Всё управление (add/update/remove/clear)
 * живёт в NotificationProvider и доступно через useNotification().
 */
interface NotificationWidgetProps {
  containerRef: RefObject<HTMLDivElement>;
}

export default function NotificationWidget({
  containerRef,
}: NotificationWidgetProps) {
  const { items, removingIds, settings } = useNotificationState();

  const positionsRef = useRef<Map<string, DOMRect>>(new Map());
  const alertAnnouncement = useAlertAnnouncements(items);

  useLayoutEffect(() => {
    positionsRef.current = animateNotificationFlip(
      containerRef.current,
      positionsRef.current,
    );
  }, [items]);

  return (
    <>
      {items.length > 0 && (
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
                  <NotificationCard
                    {...item}
                    settings={itemSettings}
                  />
                </ErrorBoundary>
              </div>
            );
          })}
        </div>
      )}
      <div
        className={omni("notification-widget__announcer")}
        aria-live="assertive"
        aria-atomic="true"
      >
        {alertAnnouncement}
      </div>
    </>
  );
}

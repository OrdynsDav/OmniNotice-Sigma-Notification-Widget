import { useEffect, useMemo, useState } from "react";
import type { NotificationCardProps, NotificationSettings } from "../types";
import notificationSettings from "../config/notification.config";
import { renderIcon } from "../helpers/renderIcon";
import "./NotificationCard.css";
import { omni } from "../helpers/omni";
import { resolveSettings } from "../helpers/resolveSettings";
import { renderNotificationPicture } from "../helpers/renderNotificationPicture";
import { useKeyboardClose } from "../helpers/a11y/useKeyboardClose";

type NotificationCardComponentProps = NotificationCardProps & {
  /** Глобальные настройки виджета (по умолчанию из конфига) */
  baseSettings?: NotificationSettings;
};

export default function NotificationCard({
  title,
  status,
  description,
  picture,
  action,
  onClose,
  settings: overrides,
  baseSettings = notificationSettings,
}: NotificationCardComponentProps) {
  const settings = useMemo(
    () => resolveSettings(baseSettings, overrides),
    [baseSettings, overrides],
  );
  const resolvedButtonHref = action?.url;

  // Пути, которые не загрузились: для них идём дальше по цепочке.
  // Хранится URL, поэтому при смене пути ошибка сбрасывается сама.
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const markFailed = (url: string) =>
    setFailedUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
  const hasButton = Boolean(action) && resolvedButtonHref;

  // Автоматическое закрытие по таймауту
  useEffect(() => {
    const autoCloseMs = settings.autoCloseMs;
    if (autoCloseMs === undefined || autoCloseMs <= 0) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(timer);
  }, [onClose, settings.autoCloseMs]);

  const handleCardKeyDown = useKeyboardClose(settings.keyboardClose, onClose);

  return (
    <div
      className={omni(
        "notification-card",
        settings.borderBottom && "notification-card--border-bottom",
      )}
      data-status={status}
      onKeyDown={handleCardKeyDown}
    >
      <div className={omni("notification-card__inner")}>
        <div className={omni("notification-card__icon")} aria-hidden="true">
          {renderNotificationPicture({
            picture,
            failedUrls,
            defaultIcon: settings.defaultIcon,
            onImageError: markFailed,
            imageAlt: `Иконка уведомления под названием ${title}`,
          })}
        </div>
        <div className={omni("notification-card__content")}>
          <p className={omni("notification-card__title")}>{title}</p>
          <p className={omni("notification-card__description")}>
            {description}
          </p>
          {hasButton && (
            <a
              href={resolvedButtonHref}
              className={omni("notification-card__button")}
              tabIndex={settings.keyboardNavigation ? undefined : -1}
            >
              {action?.title}
            </a>
          )}
        </div>
      </div>
      {settings.closeButtonEnabled && (
        <button
          className={omni("notification-card__close")}
          type="button"
          onClick={onClose}
          aria-label="Закрыть уведомление"
          tabIndex={settings.keyboardNavigation ? undefined : -1}
        >
          {renderIcon(settings.closeIcon, {
            className: omni("notification-card__close-icon"),
          })}
        </button>
      )}
    </div>
  );
}

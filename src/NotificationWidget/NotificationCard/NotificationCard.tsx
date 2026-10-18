import {
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { NotificationCardProps, NotificationSettings } from "../types";
import notificationSettings from "../config/notification.config";
import { renderIcon } from "../helpers/renderIcon";
import "./NotificationCard.css";
import { omni } from "../helpers/omni";
import { resolveSettings } from "../helpers/resolveSettings";
import { renderNotificationPicture } from "../helpers/renderNotificationPicture";

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
  role = "status",
}: NotificationCardComponentProps) {
  const settings = useMemo(
    () => resolveSettings(baseSettings, overrides),
    [baseSettings, overrides],
  );
  const { key: closeKey, scope: closeScope } = settings.closeKeyboard;

  const resolvedButtonHref = action?.url;
  const titleId = useId();
  const descriptionId = useId();

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

  // Закрытие клавишей, scope: "global" — слушаем весь документ
  useEffect(() => {
    if (closeScope !== "global" || !closeKey) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Если клавишу уже обработал кто-то другой (модалка, dropdown) — не трогаем
      if (event.defaultPrevented || event.key !== closeKey) return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, closeKey, closeScope]);

  // Закрытие клавишей, scope: "focused" — только когда фокус внутри карточки
  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (closeScope !== "focused" || !closeKey || event.key !== closeKey) return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  return (
    <div
      className={omni("notification-card")}
      data-status={status}
      role={role ?? "status"}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={closeScope === "focused" ? -1 : undefined}
      onKeyDown={handleCardKeyDown}
    >
      <div className={omni("notification-card__inner")}>
        <div className={omni("notification-card__icon")} aria-hidden="true">
          {renderNotificationPicture({
            picture,
            failedUrls,
            defaultIcon: settings.defaultIcon,
            onImageError: markFailed,
          })}
        </div>
        <div className={omni("notification-card__content")}>
          <p id={titleId} className={omni("notification-card__title")}>
            {title}
          </p>
          <p
            id={descriptionId}
            className={omni("notification-card__description")}
          >
            {description}
          </p>
          {hasButton && (
            <a
              href={resolvedButtonHref}
              className={omni("notification-card__button")}
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
        >
          {renderIcon(settings.closeIcon, {
            className: omni("notification-card__close-icon"),
          })}
        </button>
      )}
    </div>
  );
}

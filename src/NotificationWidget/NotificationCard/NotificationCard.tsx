import { useEffect, useId, useRef, useState } from "react";
import type { NotificationCardProps, NotificationSettings } from "../types";
import notificationSettings from "../notification.config";
import { renderIcon } from "../helpers/renderIcon";
import "./NotificationCard.css";

type NotificationCardComponentProps = NotificationCardProps & {
  settings?: NotificationSettings;
};

export default function NotificationCard({
  title,
  description,
  picture,
  buttonText,
  buttonHref,
  onClose,
  settings = notificationSettings,
}: NotificationCardComponentProps) {
  const resolvedButtonHref = buttonHref ?? settings.buttonHref;
  const titleId = useId();
  const descriptionId = useId();
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl =
    picture.icon || picture.preview || picture.main || picture.cover;

  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const hasButton = Boolean(buttonText) && resolvedButtonHref;

  // При появлении карточки: запоминаем, что было в фокусе,
  // и переводим фокус на карточку, чтобы скринридер её анонсировал
  // и клавиатурный пользователь сразу мог с ней взаимодействовать.
  useEffect(() => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    containerRef.current?.focus();

    return () => {
      // При закрытии/размонтировании возвращаем фокус туда, где он был
      previouslyFocusedElement.current?.focus?.();
    };
  }, []);

  // Автоматическое закрытие по таймауту
  useEffect(() => {
    const autoCloseMs = settings.autoCloseMs;
    if (autoCloseMs === undefined || autoCloseMs <= 0) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(timer);
  }, [onClose, settings.autoCloseMs]);

  // Закрытие по кнопке с клавиатуры
  useEffect(() => {
    const closeKey = settings.closeWithKeyboard;
    if (!closeKey) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === closeKey) {
        event.preventDefault();
        onClose();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, settings.closeWithKeyboard]);

  return (
    <div
      ref={containerRef}
      className="notification-card"
      role="alert"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
    >
      <div className="notification-card__inner">
        <div className="notification-card__icon" aria-hidden="true">
          {imageUrl && !imageFailed ? (
            <img src={imageUrl} alt="" onError={() => setImageFailed(true)} />
          ) : picture.emoji ? (
            <span>{picture.emoji}</span>
          ) : (
            renderIcon(settings.defaultIcon)
          )}
        </div>
        <div className="notification-card__content">
          <p id={titleId} className="notification-card__title">
            {title}
          </p>
          <p id={descriptionId} className="notification-card__description">
            {description}
          </p>
          {hasButton && (
            <a href={resolvedButtonHref} className="notification-card__button">
              {buttonText}
            </a>
          )}
        </div>
      </div>
      {settings.closeButtonEnabled && (
        <button
          className="notification-card__close"
          type="button"
          onClick={onClose}
          aria-label={"Закрыть уведомление"}
        >
          {renderIcon(settings.closeIcon)}
        </button>
      )}
    </div>
  );
}

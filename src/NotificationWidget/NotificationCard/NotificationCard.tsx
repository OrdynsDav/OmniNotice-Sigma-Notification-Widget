import { ComponentType, isValidElement, useEffect, useId, useState } from "react";
import type { NotificationCardProps, NotificationSettings } from "../types";
import notificationSettings from "../notification.config";
import { renderIcon } from "../helpers/renderIcon";
import "./NotificationCard.css";
import { isEmoji } from "../helpers/isEmoji";

type NotificationCardComponentProps = NotificationCardProps & {
  settings?: NotificationSettings;
};

export default function NotificationCard({
  title,
  status,
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

  const { image, icon, emoji } = picture;

  // Пути, которые не загрузились: для них идём дальше по цепочке.
  // Хранится URL, поэтому при смене пути ошибка сбрасывается сама.
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const markFailed = (url: string) =>
    setFailedUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
  const isFailed = (url: string) => failedUrls.includes(url);

  const hasButton = Boolean(buttonText) && resolvedButtonHref;

  const renderPicture = () => {
    // 1. image: путь к картинке
    if (image && !isFailed(image)) {
      return (
        <img
          className="notification-card__image"
          src={image}
          alt=""
          onError={() => markFailed(image)}
        />
      );
    }

    // 2. icon: путь к svg / готовый <svg> / компонент
    if (icon) {
      if (typeof icon === "string") {
        if (!isFailed(icon)) {
          return (
            <img
              className="notification-card__image"
              src={icon}
              alt=""
              onError={() => markFailed(icon)}
            />
          );
        }
      } else if (isValidElement(icon)) {
        return icon;
      } else {
        const Icon = icon as ComponentType;
        return <Icon />;
      }
    }

    // 3. emoji
    if (isEmoji(emoji)) return <span>{emoji.trim()}</span>;

    // 4. иконка по умолчанию
    return renderIcon(settings.defaultIcon);
  };

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
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, settings.closeWithKeyboard]);

  return (
    <div
      className="notification-card"
      data-status={status}
      role="alert"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="notification-card__inner">
        <div className="notification-card__icon" aria-hidden="true">
          {renderPicture()}
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
          aria-label="Закрыть уведомление"
        >
          {renderIcon(settings.closeIcon)}
        </button>
      )}
    </div>
  );
}
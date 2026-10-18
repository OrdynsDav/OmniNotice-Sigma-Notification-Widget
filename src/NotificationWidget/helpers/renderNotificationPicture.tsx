import type { ReactNode } from "react";
import { isEmoji } from "./isEmoji";
import { omni } from "./omni";
import { renderIcon } from "./renderIcon";
import type { NotificationIcon, NotificationPicture } from "../types";

interface RenderNotificationPictureOptions {
  picture: NotificationPicture;
  failedUrls: string[];
  defaultIcon: NotificationIcon;
  onImageError: (url: string) => void;
}

export function renderNotificationPicture({
  picture,
  failedUrls,
  defaultIcon,
  onImageError,
}: RenderNotificationPictureOptions): ReactNode {
  const { main, preview, cover, icon, emoji } = picture;
  const isFailed = (url: string) => failedUrls.includes(url);

  // main => preview => cover: первая непустая и не упавшая картинка
  const imageSrc = [main, preview, cover].find(
    (url) => url !== undefined && url !== "" && !isFailed(url),
  );

  if (imageSrc) {
    return (
      <img
        className={omni("notification-card__image")}
        src={imageSrc}
        alt=""
        onError={() => onImageError(imageSrc)}
      />
    );
  }

  // Иконка уведомления может быть URL, готовым ReactNode или компонентом.
  if (icon) {
    if (typeof icon === "string") {
      if (!isFailed(icon)) {
        return (
          <img
            className={omni("notification-card__image")}
            src={icon}
            alt=""
            onError={() => onImageError(icon)}
          />
        );
      }
    } else {
      return renderIcon(icon, {
        className: omni("notification-card__image"),
      });
    }
  }

  if (isEmoji(emoji)) return <span>{emoji.trim()}</span>;

  return renderIcon(defaultIcon, {
    className: omni("notification-card__default-icon"),
  });
}

import type { ComponentType, ReactNode } from "react";

export type NotificationIcon =
  | ReactNode
  | ComponentType<{ className?: string }>;

export type CloseKeyScope = "global" | "focused" | "off";

export interface KeyboardCloseSettings {
  /** Значение KeyboardEvent.key: "Escape", "Delete", "q"... */
  key: string;
  /**
   * - "focused": только когда фокус внутри карточки
   * - "global": на любое нажатие в документе
   * - "off": клавишей не закрывать
   */
  scope: CloseKeyScope;
}

export interface NotificationSettings {
  maxVisible: number;
  removalAnimationMs: number;
  keyboardClose: KeyboardCloseSettings;
  closeButtonEnabled: boolean;
  autoCloseMs: number;
  keyboardNavigation: boolean;
  defaultIcon: NotificationIcon;
  closeIcon: NotificationIcon;
  borderBottom?: boolean;
}

/**
 * Настройки, которые имеют смысл на уровне одного уведомления.
 * maxVisible — настройка списка, сюда не входит.
 */
export type NotificationItemSettings = Pick<
  NotificationSettings,
  | "removalAnimationMs"
  | "keyboardClose"
  | "closeButtonEnabled"
  | "autoCloseMs"
  | "keyboardNavigation"
  | "defaultIcon"
  | "closeIcon"
>;

/**
 * Частичное переопределение настроек виджета.
 * keyboardClose можно задать частично (например, только scope).
 */
export type NotificationSettingsOverrides = Partial<
  Omit<NotificationSettings, "keyboardClose">
> & {
  keyboardClose?: Partial<KeyboardCloseSettings>;
};

/** Частичное переопределение настроек одного уведомления. */
export type NotificationItemOverrides = Partial<
  Omit<NotificationItemSettings, "keyboardClose">
> & {
  keyboardClose?: Partial<KeyboardCloseSettings>;
};

export interface NotificationPicture {
  /** Основная картинка (наивысший приоритет) */
  main?: string;
  /** Превью, если main нет или не загрузилась */
  preview?: string;
  /** Обложка, если нет main и preview или они не загрузились */
  cover?: string;
  /** Компонент с svg, готовый <svg>…</svg> или путь к svg-файлу */
  icon?: NotificationIcon;
  /** Эмодзи */
  emoji?: string;
}

export interface NotificationApiItem {
  status: string;
  title: string;
  description: string;
  picture: NotificationPicture;
}

export interface NotificationAppItem extends NotificationApiItem {
  /** Переопределение глобального конфига для этого уведомления */
  settings?: NotificationItemOverrides;
}

export interface NotificationCardProps extends NotificationAppItem {
  onClose: () => void;
  action?: {
    url: string;
    title: string;
  };
  role?: "status" | "alert";
}

export interface NotificationListItem extends NotificationCardProps {
  id: string;
}

export interface NotificationWidgetHandle {
  add: (
    notification: Omit<NotificationCardProps, "onClose"> & { id?: string },
  ) => string;
  remove: (id: string) => void;
}

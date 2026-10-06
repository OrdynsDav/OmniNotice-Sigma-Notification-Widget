import type { ComponentType } from "react";

export interface NotificationSettings {
  maxVisible: number;
  removalAnimationMs: number;
  closeWithKeyboard: string;
  closeButtonEnabled: boolean;
  autoCloseMs?: number;
  buttonHref: string;
  defaultIcon: ComponentType;
  closeIcon: ComponentType;
}

export interface NotificationPicture {
  main?: string;
  preview?: string;
  cover?: string;
  icon?: string;
  emoji?: string;
}

export interface NotificationApiItem {
  status: string;
  title: string;
  description: string;
  picture: NotificationPicture;
}

export interface NotificationCardProps extends NotificationApiItem {
  onClose: () => void;
  buttonText?: string;
  buttonHref?: string;
}

export interface NotificationListItem extends NotificationCardProps {
  id: string;
}

export interface NotificationWidgetHandle {
  add: (notification: Omit<NotificationCardProps, "id" | "onClose">) => void;
  remove: (id: string) => void;
}

export interface NotificationWidgetProps {
  maxVisible?: number;
  removalAnimationMs?: number;
  settings?: Partial<NotificationSettings>;
}

import { createContext, useContext } from "react";
import type { NotificationListItem, NotificationWidgetHandle } from "../types";
import type notificationSettings from "../config/notification.config";

export type ResolvedSettings = typeof notificationSettings;

/** Данные для add(): включая необязательные id и settings */
export type NotificationInput = Parameters<NotificationWidgetHandle["add"]>[0];

/** Что можно поменять у уже показанного уведомления */
export type NotificationPatch = Partial<Omit<NotificationInput, "id">>;

export interface NotificationActions {
  /** Добавить уведомление, вернуть его id */
  add: (notification: NotificationInput) => string;
  /** Изменить поля существующего уведомления (settings сливаются) */
  update: (id: string, patch: NotificationPatch) => void;
  /** Закрыть уведомление (с анимацией) */
  remove: (id: string) => void;
  /** Закрыть все уведомления */
  clear: () => void;
}

export interface NotificationState {
  items: NotificationListItem[];
  removingIds: Set<string>;
  /** Глобальные настройки (уже с учётом props провайдера) */
  settings: ResolvedSettings;
}

export const NotificationActionsContext =
  createContext<NotificationActions | null>(null);
export const NotificationStateContext = createContext<NotificationState | null>(
  null,
);

export function useNotification(): NotificationActions {
  const ctx = useContext(NotificationActionsContext);
  if (!ctx) {
    throw new Error("useNotification must be used within <NotificationProvider>");
  }
  return ctx;
}

/** Внутренний хук для виджета */
export function useNotificationState(): NotificationState {
  const ctx = useContext(NotificationStateContext);
  if (!ctx) {
    throw new Error(
      "useNotificationState must be used within <NotificationProvider>",
    );
  }
  return ctx;
}
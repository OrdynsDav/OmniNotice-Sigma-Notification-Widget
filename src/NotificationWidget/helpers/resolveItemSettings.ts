import type { NotificationItemOverrides, NotificationSettings } from "../types";

/** Глобальный конфиг + настройки уведомления; undefined в override игнорируются */
export function resolveItemSettings(
  base: NotificationSettings,
  override?: NotificationItemOverrides,
): NotificationSettings {
  if (!override) return base;

  const result = { ...base } as NotificationSettings & Record<string, unknown>;

  const { keyboardClose, ...rest } = override;

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value;
    }
  });

  if (keyboardClose) {
    result.keyboardClose = {
      ...base.keyboardClose,
      ...Object.fromEntries(
        Object.entries(keyboardClose).filter(
          ([, value]) => value !== undefined,
        ),
      ),
    };
  }

  return result;
}

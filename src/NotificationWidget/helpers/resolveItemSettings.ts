import type { NotificationItemOverrides, NotificationSettings } from "../types";

/** Глобальный конфиг + настройки уведомления; undefined в override игнорируются */
export function resolveItemSettings(
  base: NotificationSettings,
  override?: NotificationItemOverrides,
): NotificationSettings {
  if (!override) return base;

  const result = { ...base } as NotificationSettings & Record<string, unknown>;

  const { closeKeyboard, ...rest } = override;

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value;
    }
  });

  if (closeKeyboard) {
    result.closeKeyboard = {
      ...base.closeKeyboard,
      ...Object.fromEntries(
        Object.entries(closeKeyboard).filter(([, value]) => value !== undefined),
      ),
    };
  }

  return result;
}
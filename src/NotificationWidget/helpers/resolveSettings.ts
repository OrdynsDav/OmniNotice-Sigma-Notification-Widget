import type {
  NotificationSettings,
  NotificationSettingsOverrides,
} from "../types";

export function resolveSettings(
  base: NotificationSettings,
  overrides?: NotificationSettingsOverrides,
): NotificationSettings {
  if (!overrides) return base;

  const { keyboardClose, ...rest } = overrides;

  // Отбрасываем поля со значением undefined, чтобы они не затирали base
  const defined = Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== undefined),
  ) as Partial<NotificationSettings>;

  return {
    ...base,
    ...defined,
    keyboardClose: {
      ...base.keyboardClose,
      ...(keyboardClose &&
        Object.fromEntries(
          Object.entries(keyboardClose).filter(([, v]) => v !== undefined),
        )),
    },
  };
}

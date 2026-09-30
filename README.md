# Виджет с уведомлениями от OmniNotice (Вишенка)

## Использование

Получите ref компонента через `useRef` и вызывайте `add()` после получения уведомления от сервера. Список сам управляет отображением, автоматическим закрытием и удалением карточек.

```tsx
import { useEffect, useRef } from "react";
import {
  NotificationWidget,
  type NotificationWidgetHandle,
} from "omni-notice-sigma-notification-widget";
import "omni-notice-sigma-notification-widget/style.css";

export function App() {
  const listRef = useRef<NotificationWidgetHandle>(null);

  useEffect(() => {
    const loadNotification = async () => {
      try {
        const response = await fetch("/api/notifications/latest");
        if (!response.ok) return;

        const notification = await response.json();
        listRef.current?.add(notification);
      } catch (error) {
        console.error("Не удалось загрузить уведомление:", error);
      }
    };

    void loadNotification();
  }, []);

  return (
    <NotificationWidget
      ref={listRef}
      settings={{ maxVisible: 3, autoCloseMs: 3000 }}
    />
  );
}
```

Замените `/api/notifications/latest` на URL вашего API. Ответ должен содержать объект одного уведомления с полями `status`, `title`, `description` и `picture`; при успешном ответе `add()` добавит его в список. Для закрытия уведомления извне используйте `listRef.current?.remove(id)`, если у вас есть его `id`.

## Настройки

Параметр `settings` компонента `NotificationWidget` позволяет переопределить любые значения по умолчанию. Неуказанные значения сохраняют дефолты виджета. Отдельные props `maxVisible` и `removalAnimationMs` имеют приоритет над значениями из `settings`.

```tsx
import { NotificationWidget } from "omni-notice-sigma-notification-widget";

<NotificationWidget
  settings={{
    maxVisible: 3, // максимальное количество карточек в видимости
    removalAnimationMs: 250, // насколько быстро карточка уйдет
    autoCloseMs: 3000, // через сколько уйдет. 0 - выключено
    closeWithKeyboard: "Escape", // при нажатии на кнопку на клавитуре все уведомления уходят
    closeButtonEnabled: true, // есть ли кнопка закрытия (крестик)
    buttonHref: "/notifications", // куда ведет кнопка "Посмотреть"
  }}
/>;
```

При необходимости передайте собственные React-компоненты в `defaultIcon` и `closeIcon`. Тип `NotificationSettings` экспортируется из пакета.

Стили импортируются отдельно:

```tsx
import "omni-notice-sigma-notification-widget/style.css";
```

## Использующиеся типы

```ts
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
  main: string;
  preview: string;
  cover: string;
  icon: string;
  emoji: string;
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
```

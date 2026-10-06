# omni-notice-sigma-notification-widget

React-виджет для показа уведомлений OmniNotice («Вишенка»): стек карточек с анимацией появления и удаления, автозакрытием, закрытием по клавише и поддержкой скринридеров.

- Императивный API через `ref`: `add()` и `remove()`
- Лимит одновременно видимых карточек, лишние вытесняются автоматически
- Плавное смещение карточек при добавлении и удалении
- Настраиваемые иконки, тексты кнопок и ссылки
- Типы TypeScript из коробки, форматы ESM и CJS

## Содержание

1. [Установка](#установка)
2. [Быстрый старт](#быстрый-старт)
3. [Как это работает](#как-это-работает)
4. [API](#api)
5. [Настройки](#настройки)
6. [Формат уведомления](#формат-уведомления)
7. [Примеры](#примеры)
8. [Стилизация](#стилизация)
9. [Доступность](#доступность)
10. [Типы](#типы)

## Установка

```bash
npm install omni-notice-sigma-notification-widget
```

Требования (peer-зависимости):

| Пакет       | Версия     |
| ----------- | ---------- |
| `react`     | `>=18.2.0` |
| `react-dom` | `>=18.2.0` |

React в бандл не входит: используется копия из вашего проекта.

## Быстрый старт

Подключите стили один раз, разместите виджет в корне приложения и вызывайте `add()` через `ref`.

```tsx
import { useRef } from "react";
import {
  NotificationWidget,
  type NotificationWidgetHandle,
} from "omni-notice-sigma-notification-widget";
import "omni-notice-sigma-notification-widget/style.css";

export function App() {
  const widgetRef = useRef<NotificationWidgetHandle>(null);

  const notify = () => {
    widgetRef.current?.add({
      status: "info",
      title: "Новое уведомление",
      description: "У вас есть новое сообщение, требующее внимания.",
      picture: { main: "https://example.com/image" },
      buttonText: "Посмотреть",
    });
  };

  return (
    <>
      <button onClick={notify}>Показать уведомление</button>
      <NotificationWidget
        ref={widgetRef}
        settings={{ maxVisible: 3, autoCloseMs: 5000 }}
      />
    </>
  );
}
```

Достаточно **одного** `NotificationWidget` на приложение. Положение на экране задаётся CSS (см. [Стилизация](#стилизация)).

## Как это работает

- **Порядок.** Новая карточка добавляется **сверху** списка.
- **Лимит.** Если активных карточек больше `maxVisible`, вытесняются самые старые (нижние). Вытеснение идёт через тот же механизм, что и обычное закрытие, то есть с анимацией.
- **Закрытие.** Карточка закрывается четырьмя способами:
  1. по кнопке-крестику (`closeButtonEnabled`);
  2. по клавише из `closeWithKeyboard`;
  3. автоматически через `autoCloseMs`;
  4. программно через `remove(id)`.
- **Удаление.** При закрытии карточке добавляется CSS-класс `notification-widget__item--removing`, а из DOM она удаляется через `removalAnimationMs` миллисекунд. За это время отрабатывает CSS-анимация ухода.
- **Повторное закрытие.** Повторный вызов закрытия для карточки, которая уже уходит, игнорируется.
- **Смещение остальных карточек.** Когда список меняется, оставшиеся карточки плавно «доезжают» до новой позиции (FLIP-анимация), а не прыгают.
- **Пустой список.** Если карточек нет, виджет ничего не отображает.
- **Таймер автозакрытия.** Он стартует в момент появления карточки.

## API

### `<NotificationWidget />`

Компонент с `forwardRef`. `ref` имеет тип `NotificationWidgetHandle`.

| Prop                 | Тип                             | Описание                                                                 |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| `maxVisible`         | `number`                        | Максимум видимых карточек. Приоритетнее `settings.maxVisible`.           |
| `removalAnimationMs` | `number`                        | Длительность ухода карточки. Приоритетнее `settings.removalAnimationMs`. |
| `settings`           | `Partial<NotificationSettings>` | Любые настройки. Не указанные берутся из значений по умолчанию.          |

Приоритет значений: **prop → `settings` → значения по умолчанию**.

### `NotificationWidgetHandle`

Объект, который вы получаете через `ref`.

#### `add(notification): string`

Добавляет уведомление и **возвращает его `id`**.

```ts
add: (notification: Omit<NotificationCardProps, "onClose"> & { id?: string }) =>
  string;
```

- Если `id` не передан, он генерируется автоматически.
- Если `id` передан, используется он. Значение должно быть **уникальным** среди текущих карточек: повторный `add` с существующим `id` создаст дубль `key` в React и непредсказуемое поведение `remove`.
- Поле `onClose` задавать не нужно: оно подставляется виджетом.

```tsx
// автоматический id
const id = widgetRef.current?.add({ ...notification });

// собственный id
widgetRef.current?.add({ id: "upload-status", ...notification });
```

#### `remove(id: string): void`

Закрывает уведомление с указанным `id` (с анимацией ухода). Если такого `id` нет или карточка уже закрывается, вызов ничего не делает.

```tsx
widgetRef.current?.remove("upload-status");
```

Типичный сценарий: показать «Загрузка…», а когда запрос завершился, закрыть её программно (см. [Примеры](#примеры)).

## Настройки

Передаются через `settings`. Ключи необязательны.

| Ключ                 | Тип             | По умолчанию          | Описание                                                                                        |
| -------------------- | --------------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| `maxVisible`         | `number`        |  `3`                | Максимум видимых карточек одновременно.                                                         |
| `removalAnimationMs` | `number`        |  `250`              | Время (мс) до удаления карточки из DOM после начала закрытия. Согласуйте с CSS-анимацией ухода. |
| `autoCloseMs`        | `number`        |  `3000`             | Автозакрытие через N мс. `0` или `undefined` отключает автозакрытие.                            |
| `closeWithKeyboard`  | `string`        |  `"Escape"`         | Значение `event.key`, по которому закрываются карточки. Пустая строка отключает.                |
| `closeButtonEnabled` | `boolean`       |  `true`             | Показывать ли кнопку-крестик.                                                                   |
| `buttonHref`         | `string`        |  `"/notifications"` | Ссылка по умолчанию для кнопки действия. Переопределяется полем `buttonHref` уведомления.       |
| `defaultIcon`        | `ComponentType` |  встроенная         | Иконка, если у уведомления нет ни картинки, ни эмодзи.                                          |
| `closeIcon`          | `ComponentType` |  встроенная         | Иконка кнопки закрытия.                                                                         |

Важно:

- **Клавиша закрытия действует на все карточки сразу.** Каждая карточка слушает `keydown` на уровне документа, поэтому по нажатию `Escape` закрывается весь стек.
- Клавиша распознаётся по `event.key` (`"Escape"`, `"Enter"`, `"x"` и т. д.), с учётом регистра.
- Передавать нужно только то, что хотите изменить:

```tsx
<NotificationWidget
  settings={{
    maxVisible: 5,
    autoCloseMs: 0, // не закрывать автоматически
    closeWithKeyboard: "Escape",
    buttonHref: "/inbox",
  }}
/>
```

### Свои иконки

`defaultIcon` и `closeIcon` принимают обычные React-компоненты без пропсов:

```tsx
import type { ComponentType } from "react";

const BellIcon: ComponentType = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.9V4a1 1 0 0 0-2 0v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

<NotificationWidget settings={{ defaultIcon: BellIcon }} />;
```

## Формат уведомления

Объект, который передаётся в `add()`:

| Поле          | Тип                   | Обяз. | Описание                                                                  |
| ------------- | --------------------- | ----- | ------------------------------------------------------------------------- |
| `status`      | `string`              | да    | Статус уведомления с сервера. В текущей версии визуально не используется. |
| `title`       | `string`              | да    | Заголовок.                                                                |
| `description` | `string`              | да    | Текст уведомления.                                                        |
| `picture`     | `NotificationPicture` | да    | Картинки и эмодзи (см. ниже). Может быть пустым объектом `{}`.            |
| `buttonText`  | `string`              | нет   | Текст кнопки-ссылки. **Если не указан, кнопка не показывается.**          |
| `buttonHref`  | `string`              | нет   | Ссылка кнопки. По умолчанию берётся из `settings.buttonHref`.             |
| `id`          | `string`              | нет   | Собственный идентификатор. Должен быть уникальным.                        |

### `picture`

Все поля необязательны.

| Поле      | Описание              |
| --------- | --------------------- |
| `icon`    | URL иконки            |
| `preview` | URL превью            |
| `main`    | URL основной картинки |
| `cover`   | URL обложки           |
| `emoji`   | Эмодзи                |

**Что отображается**, по порядку приоритета:

1. Первая непустая картинка в порядке `icon` → `preview` → `main` → `cover`.
2. Если картинка не загрузилась (ошибка загрузки) или её нет, то `emoji`.
3. Если и эмодзи нет, то `settings.defaultIcon`.

Иконка карточки декоративная и скринридерами не читается.

## Примеры

### Уведомление с сервера

```tsx
useEffect(() => {
  const load = async () => {
    try {
      const response = await fetch("/api/notifications/latest");
      if (!response.ok) return;

      const notification = await response.json();
      widgetRef.current?.add(notification);
    } catch (error) {
      console.error("Не удалось загрузить уведомление:", error);
    }
  };

  void load();
}, []);
```

Ответ сервера должен содержать поля `status`, `title`, `description` и `picture`.


Если уведомление должно закрываться из другого места кода, где результат `add()` недоступен, задайте свой `id`:

```tsx
widgetRef.current?.add({ id: "sync-status" /* ... */ });
// ...в другом обработчике
widgetRef.current?.remove("sync-status");
```

### Уведомление, которое не закрывается само

Если нужно «залипающее» уведомление, отключите автозакрытие виджета целиком:

```tsx
<NotificationWidget settings={{ autoCloseMs: 0 }} />
```

Автозакрытие задаётся для виджета, а не для отдельной карточки.

### Кнопка со своей ссылкой

```tsx
widgetRef.current?.add({
  status: "info",
  title: "Новый комментарий",
  description: "Иван ответил на ваш пост.",
  picture: { emoji: "💬" },
  buttonText: "Открыть",
  buttonHref: "/posts/42#comments",
});
```

## Стилизация

Стили подключаются отдельным импортом:

```tsx
import "omni-notice-sigma-notification-widget/style.css";
```

Основные CSS-классы:

| Класс                                  | Элемент                   |
| -------------------------------------- | ------------------------- |
| `.notification-widget`                 | Контейнер всего стека     |
| `.notification-widget__item`           | Обёртка одной карточки    |
| `.notification-widget__item--removing` | Карточка в процессе ухода |
| `.notification-card`                   | Сама карточка             |
| `.notification-card__inner`            | Внутренний контейнер      |
| `.notification-card__icon`             | Блок иконки / картинки    |
| `.notification-card__content`          | Блок текста               |
| `.notification-card__title`            | Заголовок                 |
| `.notification-card__description`      | Описание                  |
| `.notification-card__button`           | Кнопка-ссылка             |
| `.notification-card__close`            | Кнопка закрытия           |

Все css-переменные

```css
/* В NotificationWidget */
--omni-nfl-z-index: 999999;
--omni-nfl-top-offset: 130px;
--omni-nfl-edge-offset: 20px;
--omni-nfl-max-width: 480px;
--omni-nfl-item-gap: 16px;

--omni-nfl-reorder-duration: 0.3s;
--omni-nfl-reorder-easing: ease;

--omni-nfl-exit-duration: 0.25s;
--omni-nfl-exit-easing: ease;
--omni-nfl-exit-distance: 40px;

/* В NotificationCard */
--omni-nf-font-family:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; /*! НАДО ПОМЕНЯТЬ НА ВАШ*/

--omni-nf-color-title: #0c151d;
--omni-nf-color-description: #767a7f;
--omni-nf-color-icon-bg: #d1deff;
--omni-nf-color-icon: #487bfe;
--omni-nf-color-button-bg: #487bfe;
--omni-nf-color-button-bg-hover: #3566e0;
--omni-nf-color-button-text: #ffffff;
--omni-nf-color-close-icon: #12233f;
--omni-nf-color-close-bg-hover: #f2f4f7;
--omni-nf-color-focus-ring: #487bfe;

--omni-nf-focus-ring-width: 2px;
--omni-nf-focus-ring-offset: 2px;

--omni-nf-font-size-title: 18px;
--omni-nf-font-size-description: 16px;
--omni-nf-font-size-button: 14px;

--omni-nf-border-radius: 12px;

--omni-nf-line-height-text: 20px;

--omni-nf-spacing-icon-size: 56px;
--omni-nf-spacing-inner-gap: 16px;
--omni-nf-spacing-close-size: 24px;

--omni-nf-transition-duration: 0.15s;
--omni-nf-transition-easing: ease;

--omni-nf-animation-duration: 0.3s;
--omni-nf-animation-easing: cubic-bezier(0.16, 1, 0.3, 1);
--omni-nf-animation-distance: 40px;
```

> Время CSS-перехода должно совпадать с `removalAnimationMs`. Если оно меньше, карточка исчезнет раньше удаления; если больше, обрежется в момент удаления из DOM.

## Доступность

- Уведомления озвучиваются скринридерами автоматически при появлении, **фокус при этом перехватывается**: пользователью читается уведомление.
- Кнопка действия и крестик доступны с клавиатуры по `Tab`.
- Закрытие по клавише (`closeWithKeyboard`) работает независимо от фокуса.

## Типы

Все типы экспортируются из пакета.

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
  add: (
    notification: Omit<NotificationCardProps, "onClose"> & { id?: string },
  ) => string;
  remove: (id: string) => void;
}

export interface NotificationWidgetProps {
  maxVisible?: number;
  removalAnimationMs?: number;
  settings?: Partial<NotificationSettings>;
}
```

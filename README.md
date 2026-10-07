# omni-notice-sigma-notification-widget

React-виджет для показа уведомлений OmniNotice («Вишенка»): стек карточек с анимацией появления и удаления, автозакрытием, закрытием по клавише и поддержкой скринридеров.

- Императивный API через `ref`: `add()` и `remove()`
- Лимит одновременно видимых карточек, лишние вытесняются автоматически
- Плавное смещение карточек при добавлении и удалении
- Три способа задать картинку: `image`, `icon`, `emoji`
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
10. [Миграция с 1.x на 2.0](#миграция-с-1x-на-20)
11. [Типы](#типы)

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
      picture: { image: "https://example.com/image.png" },
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

Типичный сценарий: показать «Загрузка…», а когда запрос завершился, закрыть её программно (см. [Примеры](#закрытие-из-другого-места-кода)).

## Настройки

Передаются через `settings`. Ключи необязательны.

| Ключ                 | Тип             | По умолчанию     | Описание                                                                                        |
| -------------------- | --------------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| `maxVisible`         | `number`        | `3`              | Максимум видимых карточек одновременно.                                                         |
| `removalAnimationMs` | `number`        | `250`            | Время (мс) до удаления карточки из DOM после начала закрытия. Согласуйте с CSS-анимацией ухода. |
| `autoCloseMs`        | `number`        | `3000`           | Автозакрытие через N мс. `0` или `undefined` отключает автозакрытие.                            |
| `closeWithKeyboard`  | `string`        | `"Escape"`       | Значение `event.key`, по которому закрываются карточки. Пустая строка отключает.                |
| `closeButtonEnabled` | `boolean`       | `true`           | Показывать ли кнопку-крестик.                                                                   |
| `buttonHref`         | `string`        | `"/notifications"` | Ссылка по умолчанию для кнопки действия. Переопределяется полем `buttonHref` уведомления.     |
| `defaultIcon`        | `ComponentType` | встроенная       | Иконка, если у уведомления нет подходящей картинки, иконки или эмодзи.                          |
| `closeIcon`          | `ComponentType` | встроенная       | Иконка кнопки закрытия.                                                                         |

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

| Поле          | Тип                   | Обяз. | Описание                                                                    |
| ------------- | --------------------- | ----- | --------------------------------------------------------------------------- |
| `status`      | `string`              | да    | Статус уведомления. Попадает в `data-status`|
| `title`       | `string`              | да    | Заголовок.                                                                  |
| `description` | `string`              | да    | Текст уведомления.                                                          |
| `picture`     | `NotificationPicture` | да    | Картинка, иконка или эмодзи (см. ниже). Может быть пустым объектом `{}`.    |
| `buttonText`  | `string`              | нет   | Текст кнопки-ссылки. **Если не указан, кнопка не показывается.**            |
| `buttonHref`  | `string`              | нет   | Ссылка кнопки. По умолчанию берётся из `settings.buttonHref`.               |
| `id`          | `string`              | нет   | Собственный идентификатор. Должен быть уникальным.                          |

### `status`

Значение `status` записывается в атрибут `data-status` корневого элемента карточки:

```html
<div class="notification-card" data-status="new">…</div>
```

Через `data-status` можно стилизовать карточку под свои статусы:

```css
.notification-card[data-status="warning"] {
  --omni-nf-color-icon-bg: #ffe9c7;
  --omni-nf-color-icon: #d97706;
}
```

### `picture`

Все поля необязательны.

| Поле    | Тип                                      | Описание                                                                  |
| ------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| `image` | `string`                                 | Путь или URL картинки. Заполняет блок иконки целиком.                     |
| `icon`  | `ComponentType \| ReactElement \| string` | React-компонент с svg, готовый `<svg>…</svg>` или путь к svg-файлу.       |
| `emoji` | `string`                                 | Эмодзи. Принимаются только настоящие эмодзи, любой другой текст игнорируется. |

**Что отображается**, по порядку приоритета:

1. `image`, если передан и загрузился.
2. `icon`, если передан (путь к svg тоже должен загрузиться).
3. `emoji`, если это действительно эмодзи.
4. `settings.defaultIcon`.

Если картинка или svg по пути не загрузились, берётся следующий пункт списка.

Примеры:

```tsx
picture: { image: "/avatar.png" }
picture: { emoji: "🔔" }
picture: { icon: BellIcon }                              // компонент
picture: { icon: <svg width="16" height="16">…</svg> }   // готовый svg
picture: { icon: "/icons/bell.svg" }                     // путь к svg-файлу
picture: { image: "/avatar.png", emoji: "🔔" }           // эмодзи как запасной вариант
```

Что важно знать:

- **Эмодзи проверяется.** Строка вроде `"abc"` или `"https://…"` в `emoji` не отобразится: вместо неё будет иконка по умолчанию. Поддерживаются обычные эмодзи, эмодзи с тоном кожи, составные (👨‍👩‍👧), флаги и keycap (1️⃣).
- **Цвет иконки.** Компонент и готовый `<svg>` красятся цветом `--omni-nf-color-icon` через `currentColor` (в svg используйте `fill="currentColor"` или `stroke="currentColor"`). Svg по пути выводится через `<img>`, и цвет у него изменить нельзя.
- **Путь к svg.** Он выводится как обычная картинка, поэтому нужен доступный URL.
- Блок картинки декоративный и скринридерами не читается.

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

Ответ сервера должен содержать поля `status`, `title`, `description` и `picture`. Поле `picture` с сервера может содержать только строки (`image`, `emoji`, `icon` как путь к svg).

### Закрытие из другого места кода

Если уведомление должно закрываться из другого места, где результат `add()` недоступен, задайте свой `id`:

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

| Класс                                  | Элемент                                   |
| -------------------------------------- | ----------------------------------------- |
| `.notification-widget`                 | Контейнер всего стека                     |
| `.notification-widget__item`           | Обёртка одной карточки                    |
| `.notification-widget__item--removing` | Карточка в процессе ухода                 |
| `.notification-card`                   | Сама карточка (с атрибутом `data-status`) |
| `.notification-card__inner`            | Внутренний контейнер                      |
| `.notification-card__icon`             | Блок иконки / картинки / эмодзи           |
| `.notification-card__image`            | Тег `<img>` внутри блока иконки           |
| `.notification-card__content`          | Блок текста                               |
| `.notification-card__title`            | Заголовок                                 |
| `.notification-card__description`      | Описание                                  |
| `.notification-card__button`           | Кнопка-ссылка                             |
| `.notification-card__close`            | Кнопка закрытия                           |

Все CSS-переменные:

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
/* Замените шрифт на шрифт вашего проекта */
--omni-nf-font-family:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;

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

> Длительность CSS-анимации ухода (`--omni-nfl-exit-duration`) должна совпадать с `removalAnimationMs`. Если она меньше, карточка исчезнет раньше удаления; если больше, обрежется в момент удаления из DOM.

При включённом `prefers-reduced-motion: reduce` анимация появления карточки отключается.

## Доступность

- Каждая карточка имеет `role="alert"`, поэтому скринридеры озвучивают новое уведомление автоматически при появлении.
- Заголовок и описание связаны с карточкой через `aria-labelledby` и `aria-describedby`.
- Контейнер стека имеет `role="region"` и `aria-label="Уведомления"`.
- **Фокус при появлении карточки не перехватывается.** Пользователь продолжает работать там, где был (например, в поле ввода).
- Кнопка действия и крестик доступны с клавиатуры по `Tab`, у них есть видимый индикатор фокуса (`:focus-visible`).
- Если фокус находился внутри карточки в момент её закрытия, он возвращается на последний элемент вне виджета. Если такого элемента уже нет на странице, фокус снимается.
- Закрывающаяся карточка получает `aria-hidden="true"` только после того, как фокус из неё убран.
- Закрытие по клавише (`closeWithKeyboard`) работает независимо от фокуса.

## Типы

Все типы экспортируются из пакета.

```ts
import type { ComponentType, ReactElement } from "react";

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
  /** Путь к картинке */
  image?: string;
  /** Компонент с svg, готовый <svg>…</svg> или путь к svg-файлу */
  icon?: ComponentType | ReactElement | string;
  /** Эмодзи */
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
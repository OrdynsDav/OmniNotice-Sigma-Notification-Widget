# omni-notice-sigma-notification-widget

React-компонент для показа уведомлений OmniNotice («Вишенка»). Виджет отображает стек карточек с анимацией, автозакрытием, управлением с клавиатуры и настройками доступности.

## Возможности

- Добавление, обновление и закрытие уведомлений через `useNotification()`.
- Ограничение количества видимых карточек с автоматическим закрытием старых.
- Автоматическое и программное закрытие с анимацией.
- Картинки с резервными источниками, React-иконки и эмодзи.
- Индивидуальные настройки каждой карточки.
- Изоляция ошибок рендера каждой карточки через `ErrorBoundary`.
- Типы TypeScript, ESM и CommonJS-сборки.

## Установка

```bash
npm install omni-notice-sigma-notification-widget
```

Установите также peer-зависимости, если их ещё нет в приложении:

| Пакет                  | Версия     |
| ---------------------- | ---------- |
| `react`                | `>=18.2.0` |
| `react-dom`            | `>=18.2.0` |
| `react-error-boundary` | `>=4.1.2`  |

`react` и `react-dom` используются как peer-зависимости. `react-error-boundary` также указан как peer-зависимость и нужен для стандартной обработки ошибок карточек.

Подключите стили один раз:

```tsx
import "omni-notice-sigma-notification-widget/style.css";
```

## Быстрый старт

Оберните приложение в `NotificationProvider`. Он предоставляет API уведомлений через `useNotification()` и сам размещает стек карточек — отдельно добавлять `<NotificationWidget />` не нужно.

```tsx
import {
  NotificationProvider,
  useNotification,
} from "omni-notice-sigma-notification-widget";
import "omni-notice-sigma-notification-widget/style.css";

function NotificationsDemo() {
  const { add } = useNotification();

  return (
    <button
      onClick={() =>
        add({
          status: "info",
          title: "Новое уведомление",
          description: "У вас есть новое сообщение.",
          picture: { emoji: "🔔" },
          action: { title: "Открыть", url: "/inbox" },
        })
      }
    >
      Показать уведомление
    </button>
  );
}

export function App() {
  return (
    //...
    <NotificationProvider
      settings={{
        maxVisible: 3,
        autoCloseMs: 5000,
      }}
    >
      <Inner />
    </NotificationProvider>
    //...
  );
}
```

`useNotification()` можно вызывать только в компоненте внутри `NotificationProvider`; в противном случае хук выбросит ошибку. Обычно достаточно одного провайдера на приложение.

## Работа уведомлений

- Новые уведомления добавляются в начало списка.
- Если активных карточек становится больше `maxVisible`, самые старые закрываются с анимацией.
- Закрыть карточку можно крестиком, назначенной клавишей, по таймеру или через `remove(id)`.
- При закрытии карточка остаётся в DOM на время `removalAnimationMs`, чтобы завершилась CSS-анимация.
- Повторное закрытие уже закрывающейся карточки игнорируется.
- Пустой стек не отображается.
- Порядок карточек при изменениях плавно анимируется.

## API

### `<NotificationProvider />`

Компонент-контейнер. Внутри него доступны `useNotification()` и его действия.

| Prop                 | Тип                             | По умолчанию                            | Описание                                                               |
| -------------------- | ------------------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| `children`           | `ReactNode`                     | —                                       | Дочернее приложение.                                                   |
| `settings`           | `Partial<NotificationSettings>` | значения по умолчанию                   | Общие настройки карточек и стека.                                      |
| `maxVisible`         | `number`                        | `settings.maxVisible` или `3`           | Максимум активных карточек. Имеет приоритет над `settings.maxVisible`. |
| `removalAnimationMs` | `number`                        | `settings.removalAnimationMs` или `250` | Длительность ухода. Имеет приоритет над настройкой в `settings`.       |

```tsx
<NotificationProvider
  maxVisible={5}
  removalAnimationMs={300}
  settings={{ autoCloseMs: 4000 }}
>
  <AppContent />
</NotificationProvider>
```

Для параметров, заданных и отдельными props, и в `settings`, приоритет имеют отдельные props. Для остальных настроек используются переданные значения, затем значения по умолчанию.

### `useNotification()`

Возвращает объект с методами управления уведомлениями:

```ts
interface NotificationActions {
  add(notification: NotificationInput): string;
  update(id: string, patch: NotificationPatch): void;
  remove(id: string): void;
  clear(): void;
}
```

#### `add(notification): string`

Добавляет карточку и синхронно возвращает её `id`. Если `id` не передан, он генерируется автоматически. Пользовательский `id` должен быть уникальным среди одновременно существующих карточек.

```tsx
const id = add({
  id: "sync-status",
  status: "loading",
  title: "Синхронизация",
  description: "Идёт синхронизация данных.",
  picture: { emoji: "⏳" },
});
```

`onClose` передавать не нужно — провайдер задаёт обработчик закрытия сам.

#### `update(id, patch): void`

Обновляет поля уже существующей карточки. Передавайте только изменяемые поля; `settings` уведомления объединяются с прежними настройками.

```tsx
update(id, {
  status: "success",
  title: "Готово",
  description: "Синхронизация завершена.",
  settings: { autoCloseMs: 3000 },
});
```

#### `remove(id): void`

Запускает закрытие карточки с указанным `id`. Если карточки нет или она уже закрывается, вызов ничего не меняет.

```tsx
remove(id);
```

#### `clear(): void`

Запускает закрытие всех карточек. Карточки удаляются после завершения их анимации.

### Формат уведомления

```ts
interface NotificationAppItem {
  status: string;
  title: string;
  description: string;
  picture: NotificationPicture;
  action?: {
    title: string;
    url: string;
  };
  role?: "status" | "alert";
  settings?: NotificationItemOverrides;
  id?: string;
}
```

| Поле          | Обязательное | Описание                                                                                    |
| ------------- | ------------ | ------------------------------------------------------------------------------------------- |
| `status`      | Да           | Произвольная строка статуса; передаётся в `data-status` карточки.                           |
| `title`       | Да           | Заголовок.                                                                                  |
| `description` | Да           | Основной текст.                                                                             |
| `picture`     | Да           | Картинка, иконка или эмодзи. Можно передать `{}` — тогда будет показана стандартная иконка. |
| `action`      | Нет          | Объект `{ title, url }`. Если не передан, ссылка действия не отображается.                  |
| `role`        | Нет          | ARIA-роль карточки: `"status"` по умолчанию или `"alert"`.                                  |
| `settings`    | Нет          | Переопределения настроек только для этой карточки.                                          |
| `id`          | Нет          | Пользовательский уникальный идентификатор.                                                  |

### Изображение, иконка и эмодзи

Поля `NotificationPicture`:

| Поле      | Тип                | Описание                                                     |
| --------- | ------------------ | ------------------------------------------------------------ |
| `main`    | `string`           | Основная картинка.                                           |
| `preview` | `string`           | Запасная картинка, если `main` не задана или не загрузилась. |
| `cover`   | `string`           | Следующая запасная картинка.                                 |
| `icon`    | `NotificationIcon` | URL изображения, React-элемент или компонент иконки.         |
| `emoji`   | `string`           | Эмодзи. Строки, не распознанные как эмодзи, игнорируются.    |

При отображении используется следующий порядок:

1. Первый доступный URL из `main`, `preview`, `cover`.
2. `icon`.
3. `emoji`, если значение является эмодзи.
4. `settings.defaultIcon`.

Если URL картинки или `icon` не загружается, виджет переходит к следующему источнику.

Компонент и готовый SVG в `icon` окрашиваются через CSS `color`; для SVG используйте `currentColor`. SVG по URL отображается как `<img>`, поэтому перекрасить его из CSS нельзя.

### Настройки

Настройки можно передать провайдеру целиком или переопределить на отдельной карточке через её `settings`. `keyboardClose` можно переопределять частично, например только указать `scope`.

| Ключ                 | Тип                     | Значение по умолчанию                 | Описание                                                                                                                                                                               |
| -------------------- | ----------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxVisible`         | `number`                | `3`                                   | Максимум активных карточек.                                                                                                                                                            |
| `removalAnimationMs` | `number`                | `250`                                 | Задержка перед удалением закрываемой карточки из DOM.                                                                                                                                  |
| `autoCloseMs`        | `number`                | `5000`                                   | Автозакрытие через заданное число миллисекунд. Значение `0` или меньше отключает таймер.                                                                                               |
| `keyboardClose`      | `KeyboardCloseSettings` | `{ key: "Escape", scope: "focused" }` | Клавиша и режим её обработки.                                                                                                                                                          |
| `closeButtonEnabled` | `boolean`               | `true`                                | Показывать ли кнопку закрытия.                                                                                                                                                         |
| `keyboardNavigation` | `boolean`               | `true`                                | Включать ли ссылку действия и кнопку закрытия в последовательную навигацию клавишей `Tab`. Если `false`, эти элементы пропускаются при нажатии `Tab`, но остаются доступными для мыши. |
| `defaultIcon`        | `NotificationIcon`      | Встроенная иконка                     | Иконка, если источники из `picture` отсутствуют или не загрузились.                                                                                                                    |
| `closeIcon`          | `NotificationIcon`      | Встроенная иконка                     | Иконка кнопки закрытия.                                                                                                                                                                |
| `borderBottom`       | `boolean`               | `false`                               | Показывать нижнюю цветную границу карточки.                                                                                                                                            |

Настройки клавиатуры:

```ts
interface KeyboardCloseSettings {
  key: string;
  scope: "global" | "focused" | "off";
}
```

- `focused` — закрывать карточку, только если фокус находится внутри неё.
- `global` — обрабатывать нажатие клавиши на уровне документа. Если одновременно отображается несколько карточек, событие обрабатывает первый сработавший обработчик; последующие игнорируют уже отменённое событие.
- `off` — не закрывать карточку с клавиатуры.

```tsx
<NotificationProvider
  settings={{
    autoCloseMs: 5000,
    keyboardClose: { key: "Escape", scope: "focused" },
    keyboardNavigation: false,
    borderBottom: true,
  }}
>
  <AppContent />
</NotificationProvider>
```

Переопределение настроек одной карточки:

```tsx
add({
  status: "important",
  title: "Требуется внимание",
  description: "Это уведомление останется на экране.",
  picture: { emoji: "⚠️" },
  settings: {
    autoCloseMs: 0,
    keyboardClose: { scope: "off" },
    closeButtonEnabled: false,
    keyboardNavigation: false,
  },
});
```

`keyboardNavigation` настраивает tab-порядок интерактивных элементов уведомления, а не автоматическую установку фокуса при появлении. Значение по умолчанию `true` сохраняет обычную клавиатурную доступность ссылки и кнопки закрытия. Опция может задаваться глобально в настройках провайдера или индивидуально для карточки.

### Иконки

`defaultIcon`, `closeIcon` и `picture.icon` принимают готовый React-элемент или компонент иконки. Чтобы передать иконке собственные props, передайте уже созданный JSX-элемент:

```tsx
function BellIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill={color} d="..." />
    </svg>
  );
}

<NotificationProvider
  settings={{
    defaultIcon: <BellIcon color="tomato" />,
  }}
>
  <AppContent />
</NotificationProvider>;
```

## Обработка ошибок

Каждая карточка всегда обёрнута во внутренний `ErrorBoundary`. Ошибка рендера изолируется для этой карточки: вместо неё отображается `null`, а ошибка и component stack записываются в `console.error`. Эта граница обрабатывает ошибки рендера, но не ошибки обработчиков событий, таймеров или другого асинхронного кода. Внешний `ErrorBoundary` приложения продолжит обрабатывать ошибки за пределами карточек.

## Стилизация

Стили подключаются импортом `omni-notice-sigma-notification-widget/style.css`. Классы имеют префикс `omni-`, чтобы уменьшить вероятность конфликта с классами приложения.

Основные селекторы:

| Класс                                       | Назначение                      |
| ------------------------------------------- | ------------------------------- |
| `.omni-notification-widget`                 | Контейнер стека.                |
| `.omni-notification-widget__item`           | Обёртка карточки.               |
| `.omni-notification-widget__item--removing` | Карточка во время закрытия.     |
| `.omni-notification-card`                   | Карточка.                       |
| `.omni-notification-card--border-bottom`    | Карточка с нижней границей.     |
| `.omni-notification-card__icon`             | Блок изображения/иконки/эмодзи. |
| `.omni-notification-card__title`            | Заголовок.                      |
| `.omni-notification-card__description`      | Описание.                       |
| `.omni-notification-card__button`           | Ссылка действия.                |
| `.omni-notification-card__close`            | Кнопка закрытия.                |

CSS-переменные виджета:

```css
.omni-notification-widget {
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
}
```

CSS-переменные карточки:

```css
.omni-notification-card {
  --omni-nf-font-family: var(
    --font-family-base,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif
  );

  --omni-nf-color-base: var(--color-primary, #487bfe);
  --omni-nf-color-title: var(--color-text-primary, #0c151d);
  --omni-nf-color-description: var(--color-text-secondary, #767a7f);
  --omni-nf-color-icon: var(--omni-nf-color-base, #487bfe);
  --omni-nf-color-icon-bg: #d1deff;
  --omni-nf-color-button-bg: var(--omni-nf-color-base, #487bfe);
  --omni-nf-color-button-bg-hover: hsl(
    from var(--omni-nf-color-base) h s calc(l - 10)
  );
  --omni-nf-color-button-text: #ffffff;
  --omni-nf-color-close-icon: #12233f;
  --omni-nf-color-close-bg-hover: #f2f4f7;
  --omni-nf-color-focus-ring: var(--omni-nf-color-base, #487bfe);

  --omni-nf-focus-ring-width: 2px;
  --omni-nf-focus-ring-offset: 2px;

  --omni-nf-font-size-title: 18px;
  --omni-nf-font-size-description: 16px;
  --omni-nf-font-size-button: 14px;

  --omni-nf-border-radius-lg: var(--radius-lg, 12px);
  --omni-nf-border-radius-md: var(--radius-md, 8px);

  --omni-nf-line-height-text: 20px;

  --omni-nf-spacing-icon-size: 56px;
  --omni-nf-spacing-inner-gap: 16px;
  --omni-nf-spacing-close-size: 24px;

  --omni-nf-transition-duration: 0.15s;
  --omni-nf-transition-easing: ease;

  --omni-nf-animation-duration: 0.3s;
  --omni-nf-animation-easing: cubic-bezier(0.16, 1, 0.3, 1);
  --omni-nf-animation-distance: 40px;
}
/*Меняет значение переменной, если поддерживается color-mix()*/
@supports (background: color-mix(in srgb, #487bfe 25%, white)) {
  .omni-notification-card {
    --omni-nf-color-icon-bg: color-mix(
      in srgb,
      var(--omni-nf-color-icon) 25%,
      white
    );
  }
}
```

Пример изменения положения и ширины стека:

```css
.omni-notification-widget {
  --omni-nfl-top-offset: 24px;
  --omni-nfl-edge-offset: 16px;
  --omni-nfl-max-width: 420px;
}
```

Время CSS-анимации ухода задаётся через `removalAnimationMs`; провайдер выставляет соответствующую переменную на обёртке карточки. При `prefers-reduced-motion: reduce` анимации отключаются.

## Доступность

- Контейнер стека имеет `role="region"` и доступное имя «Уведомления».
- `role: "status"` по умолчанию не вызывает автоматического объявления при появлении карточки. При `role: "alert"` отдельная assertive live-область один раз объявляет заголовок, описание и название действия.
- Содержимое видимой карточки не является live-областью; для объявления используется отдельный скрытый announcer, чтобы избежать дублирования.
- Изображение карточки декоративное и не озвучивается скринридером.
- Появление уведомления не переносит фокус.
- Кнопки доступны с клавиатуры и имеют индикатор фокуса.
- При закрытии карточки, если фокус был внутри неё, провайдер пытается вернуть фокус на последний сфокусированный элемент вне виджета.
- Закрывающаяся карточка получает `aria-hidden` после освобождения фокуса.

## Экспортируемые типы

Пакет экспортирует типы `NotificationIcon`, `CloseKeyScope`, `KeyboardCloseSettings`, `NotificationSettings`, `NotificationItemSettings`, `NotificationSettingsOverrides`, `NotificationItemOverrides`, `NotificationPicture`, `NotificationApiItem`, `NotificationAppItem`, `NotificationCardProps`, `NotificationListItem`, `NotificationWidgetHandle`, `NotificationActions`, `NotificationInput`, `NotificationPatch` и `NotificationProviderProps`.

```tsx
import type {
  NotificationInput,
  NotificationSettings,
} from "omni-notice-sigma-notification-widget";
```

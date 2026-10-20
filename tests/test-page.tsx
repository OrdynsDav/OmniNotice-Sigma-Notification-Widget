import React from 'react';
import ReactDOM from 'react-dom/client';

//  Импортируем из локальных исходников (../src)
import { NotificationProvider, useNotification } from '../src';
 

function DemoApp() {
  const { add, clear, update } = useNotification();

  // 1. Базовое уведомление
  const showBasic = () => add({ 
    status: "info", 
    title: "Базовое", 
    description: "Описание базового уведомления", 
    picture: { emoji: "🔔" }, 
    action: { title: "Перейти", url: "/inbox" } 
  });

  // 2. 4 уведомления (для проверки maxVisible)
  const showFour = () => { 
    for (let i = 1; i <= 4; i++) {
      add({ 
        id: `test-${i}`, 
        status: "info", 
        title: `Уведомление ${i}`, 
        description: `Описание ${i}`, 
        picture: { emoji: "📌" } 
      }); 
    }
  };

  // 3. Автозакрытие
  const showAutoClose = () => add({ 
    status: "success", 
    title: "Автозакрытие", 
    description: "Исчезнет через 2 секунды", 
    picture: { emoji: "⏳" }, 
    settings: { autoCloseMs: 2000 } 
  });

  // 4. Без автозакрытия
  const showNoAutoClose = () => add({ 
    status: "warning", 
    title: "Без автозакрытия", 
    description: "Не исчезнет", 
    picture: { emoji: "⚠️" }, 
    settings: { autoCloseMs: 0 } 
  });

  // 5. Ошибка
  const showAlert = () => add({ 
    status: "error", 
    title: "Ошибка!", 
    description: "Критическое уведомление", 
    picture: { emoji: "❌" }, 
    role: "alert" 
  });

  // 6. Обновление
  const showAndUpdate = () => {
    const id = add({ 
      status: "loading", 
      title: "Загрузка...", 
      description: "Идет процесс", 
      picture: { emoji: "⏳" } 
    });
    setTimeout(() => update(id, { 
      status: "success", 
      title: "Готово!", 
      description: "Процесс завершен", 
      picture: { emoji: "✅" } 
    }), 1000);
  };

  // 7. Без кнопки закрытия
  const showNoCloseBtn = () => add({ 
    status: "info", 
    title: "Без крестика", 
    description: "Закрыть нельзя", 
    picture: {}, 
    settings: { closeButtonEnabled: false, autoCloseMs: 0 } 
  });

  // 8. Клавиатурное закрытие (Escape)
  const showKeyboard = () => add({ 
    status: "info", 
    title: "Нажми Escape", 
    description: "Закроется с клавиатуры", 
    picture: {}, 
    settings: { autoCloseMs: 0, keyboardClose: { key: "Escape", scope: "global" } } 
  });

  return (
    <div style={{ padding: 50, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: 300 }}>
      <h1>E2E Test Page (Local Source)</h1>
      <button onClick={showBasic}>1. Базовое уведомление</button>
      <button onClick={showFour}>2. Показать 4 уведомления</button>
      <button onClick={showAutoClose}>3. Автозакрытие (2с)</button>
      <button onClick={showNoAutoClose}>4. Без автозакрытия</button>
      <button onClick={showAlert}>5. Уведомление alert</button>
      <button onClick={showAndUpdate}>6. Обновление (1с)</button>
      <button onClick={showNoCloseBtn}>7. Без кнопки закрытия</button>
      <button onClick={showKeyboard}>8. Клавиатурное закрытие (Escape)</button>
      <button onClick={() => clear()} style={{ marginTop: 20, color: 'red' }}>Очистить всё</button>
    </div>
  );
}

// Монтируем приложение
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <NotificationProvider settings={{ maxVisible: 3, autoCloseMs: 5000 }}>
        <DemoApp />
      </NotificationProvider>
    </React.StrictMode>
  );
}
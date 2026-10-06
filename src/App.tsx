import "./App.css";
import { useRef, useState } from "react";
import NotificationWidget from "./NotificationWidget/Widget/NotificationWidget";
import { NotificationWidgetHandle } from "./NotificationWidget/types";

function App() {
  const listRef = useRef<NotificationWidgetHandle>(null);
  const [counter, setCounter] = useState(1);

  const showNotification = () => {
    setCounter((prev) => prev + 1);
    listRef.current?.add({
      status: "unread",
      title: `Новое уведомление ${counter}`,
      description: "У вас есть новое сообщение, требующее внимания.",
      picture: {
        icon: "",
      },
      buttonText: "Посмотреть",
    });
  };

  return (
    <div>
      <button
        style={{
          background: "blue",
          borderRadius: "8px",
          padding: "12px 20px",
          color: "white",
          marginInline: "auto",
          display: "block",
          border: "none",
          marginTop: "12px",
          cursor: "pointer",
        }}
        onClick={showNotification}
      >
        Показать уведомление
      </button>
      <NotificationWidget ref={listRef} settings={{
        autoCloseMs: 0
      }}/>
    </div>
  );
}

export default App;

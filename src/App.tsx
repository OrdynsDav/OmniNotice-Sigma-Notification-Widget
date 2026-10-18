import { useState } from "react";
import { useNotification } from "./NotificationWidget/context/NotificationContext";
import { NotificationProvider } from "./NotificationWidget/provider/NotificationProvider";

function Demo() {
  const { add } = useNotification();
  const [counter, setCounter] = useState(1);

  const showNotification = () => {
    setCounter((prev) => prev + 1);
    add({
      role: "alert",
      status: "unread",
      title: `Новое уведомление ${counter}`,
      description: "У вас есть новое сообщение, требующее внимания.",
      picture: {
        cover:
          "https://avatars.mds.yandex.net/i?id=35ea9f0fc6e83d112a951a989af2f7bc_l-6262780-images-thumbs&n=13",
      },
      action: {
        title: "Посмотреть",
        url: "#",
      },
    });
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/bg.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
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
    </div>
  );
}

function App() {
  return (
    <NotificationProvider
      settings={{
        maxVisible: 3,
        autoCloseMs: 0,
      }}
    >
      <Demo />
    </NotificationProvider>
  );
}

export default App;

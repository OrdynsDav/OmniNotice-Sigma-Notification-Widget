import { useEffect, useRef, useState } from "react";
import type { NotificationListItem } from "../../types";

export function useAlertAnnouncements(items: NotificationListItem[]) {
  const announcedAlertIdsRef = useRef(new Set<string>());
  const pendingAlertsRef = useRef<string[]>([]);
  const announcementTimerRef = useRef<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const currentIds = new Set(items.map((item) => item.id));
    for (const id of announcedAlertIdsRef.current) {
      if (!currentIds.has(id)) announcedAlertIdsRef.current.delete(id);
    }

    const newAlerts = items.filter(
      (item) =>
        item.role === "alert" && !announcedAlertIdsRef.current.has(item.id),
    );
    if (newAlerts.length === 0) return;

    newAlerts.forEach((item) => {
      announcedAlertIdsRef.current.add(item.id);
      pendingAlertsRef.current.push(
        [item.title, item.description, item.action?.title]
          .filter(Boolean)
          .join(" "),
      );
    });

    if (announcementTimerRef.current !== null) return;
    setAnnouncement("");
    announcementTimerRef.current = window.setTimeout(() => {
      announcementTimerRef.current = null;
      setAnnouncement(pendingAlertsRef.current.join(" "));
      pendingAlertsRef.current = [];
    }, 50);
  }, [items]);

  useEffect(
    () => () => {
      if (announcementTimerRef.current !== null) {
        window.clearTimeout(announcementTimerRef.current);
      }
    },
    [],
  );

  return announcement;
}

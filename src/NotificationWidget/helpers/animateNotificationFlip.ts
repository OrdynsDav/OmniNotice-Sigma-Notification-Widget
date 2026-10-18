export function animateNotificationFlip(
  container: HTMLElement | null,
  previousPositions: Map<string, DOMRect>,
): Map<string, DOMRect> {
  if (!container) return new Map();

  const nextPositions = new Map<string, DOMRect>();
  const children = Array.from(
    container.querySelectorAll<HTMLElement>("[data-notification-id]"),
  );

  children.forEach((child) => {
    const id = child.dataset.notificationId;
    if (id) nextPositions.set(id, child.getBoundingClientRect());
  });

  children.forEach((child) => {
    const id = child.dataset.notificationId;
    if (!id) return;

    const oldRect = previousPositions.get(id);
    const newRect = nextPositions.get(id);
    if (!oldRect || !newRect) return;

    const deltaY = oldRect.top - newRect.top;
    if (deltaY === 0) return;

    child.style.transition = "none";
    child.style.transform = `translateY(${deltaY}px)`;

    requestAnimationFrame(() => {
      child.style.transition = "";
      child.style.transform = "";
    });
  });

  return nextPositions;
}

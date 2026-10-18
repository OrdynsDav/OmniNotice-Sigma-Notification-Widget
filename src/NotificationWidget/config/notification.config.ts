import { BellRing } from "../../icons/BellRing";
import { CloseIcon } from "../../icons/CloseIcon";
import type { NotificationSettings } from "../types";

const notificationSettings: NotificationSettings = {
  maxVisible: 3,
  removalAnimationMs: 250,
  closeKeyboard: {
    key: "Escape",
    scope: "focused"
  },
  closeButtonEnabled: true,
  autoCloseMs: 0,
  defaultIcon: BellRing,
  closeIcon: CloseIcon,
};

export default notificationSettings;

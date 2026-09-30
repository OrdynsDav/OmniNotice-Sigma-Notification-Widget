import { BellRing } from "../icons/BellRing";
import { CloseIcon } from "../icons/CloseIcon";
import type { NotificationSettings } from "./types";

const notificationSettings: NotificationSettings = {
  maxVisible: 3,
  removalAnimationMs: 250,
  closeWithKeyboard: "",
  closeButtonEnabled: true,
  buttonHref: "#",
  autoCloseMs: 3000,
  defaultIcon: BellRing,
  closeIcon: CloseIcon,
};

export default notificationSettings;
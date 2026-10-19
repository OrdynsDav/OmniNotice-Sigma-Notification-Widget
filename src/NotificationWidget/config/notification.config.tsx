import { BellRing } from "../../icons/BellRing";
import { CloseIcon } from "../../icons/CloseIcon";
import type { NotificationSettings } from "../types";

const notificationSettings: NotificationSettings = {
  maxVisible: 3,
  removalAnimationMs: 250,
  keyboardClose: {
    key: "Escape",
    scope: "focused",
  },
  closeButtonEnabled: true,
  autoCloseMs: 5000,
  keyboardNavigation: true,
  defaultIcon: <BellRing />,
  closeIcon: <CloseIcon />,
  borderBottom: false,
};

export default notificationSettings;

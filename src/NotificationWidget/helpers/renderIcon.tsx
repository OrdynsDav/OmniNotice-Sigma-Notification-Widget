import {
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import type { NotificationIcon } from "../types";

export function renderIcon(
  Icon: NotificationIcon,
  props: { className?: string } = {},
): ReactNode {
  if (isValidElement<{ className?: string }>(Icon)) {
    const className = [Icon.props.className, props.className]
      .filter(Boolean)
      .join(" ");

    return cloneElement(Icon, { ...props, className });
  }

  if (typeof Icon === "function") {
    const IconComponent = Icon;
    return <IconComponent {...props} />;
  }

  return Icon;
}
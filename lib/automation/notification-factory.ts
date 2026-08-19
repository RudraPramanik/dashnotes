import { automationConfig } from "./config";
import { stubNotificationPort } from "./notification-stub";
import type { NotificationPort } from "./types";

export function createNotificationPort(): NotificationPort {
  if (!automationConfig.enabled) {
    return stubNotificationPort;
  }
  return stubNotificationPort;
}

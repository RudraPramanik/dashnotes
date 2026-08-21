import type { NotificationPort } from "./types";

export const stubNotificationPort: NotificationPort = {
  subscribe(): void {
    // no-op until automation is enabled
  },
  disconnect(): void {
    // no-op
  },
};

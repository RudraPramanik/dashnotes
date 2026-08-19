"use client";

import { useEffect } from "react";

import { createNotificationPort } from "@/lib/automation/notification-factory";

export function useAutomationNotifications(): void {
  useEffect(() => {
    const port = createNotificationPort();
    port.subscribe(
      () => {
        // events ignored until inbox ships
      },
      () => {
        // stub / disabled port
      },
    );
    return () => {
      port.disconnect();
    };
  }, []);
}

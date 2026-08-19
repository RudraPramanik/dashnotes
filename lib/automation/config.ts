export const automationConfig = {
  enabled: process.env.NEXT_PUBLIC_AUTOMATION_ENABLED === "true",
  notificationsUrl: "/ai/notifications/stream",
};

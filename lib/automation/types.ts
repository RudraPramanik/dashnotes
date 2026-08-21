export type AutomationPendingEvent = {
  id: string;
  type: string;
  confidence: number;
};

export type NotificationPort = {
  subscribe: (
    onEvent: (event: AutomationPendingEvent) => void,
    onError: (error: Error) => void,
  ) => void;
  disconnect: () => void;
};

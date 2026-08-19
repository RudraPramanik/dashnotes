"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    function handleOnline(): void {
      setOnline(true);
    }
    function handleOffline(): void {
      setOnline(false);
    }
    setOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) {
    return null;
  }

  return (
    <div className="border-b bg-destructive/10 px-4 py-2 text-sm">
      You are offline. Reconnect to load the latest notes and files.
    </div>
  );
}

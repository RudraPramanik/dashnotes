import { AiErrorBoundary } from "@/components/errors/AiErrorBoundary";
import { AiDegradationBanner } from "@/components/shell/AiDegradationBanner";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppShellEffects } from "@/components/shell/AppShellEffects";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { BottomTabBar } from "@/components/shell/BottomTabBar";
import { ContextPanel } from "@/components/shell/ContextPanel";
import { OfflineBanner } from "@/components/shell/OfflineBanner";
import { RateLimitBanner } from "@/components/shell/RateLimitBanner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <AppShellEffects />
      <OfflineBanner />
      <RateLimitBanner />
      <AiDegradationBanner />
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col pb-14 md:pb-0">
          <AppHeader />
          <div className="flex min-h-0 flex-1">
            <main className="min-w-0 flex-1 overflow-y-auto p-4">{children}</main>
            <AiErrorBoundary>
              <ContextPanel />
            </AiErrorBoundary>
          </div>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}

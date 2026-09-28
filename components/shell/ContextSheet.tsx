"use client";

import type { ReactNode } from "react";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useShellStore } from "@/lib/stores/shell-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type ContextSheetProps = {
  children?: ReactNode;
  title?: string;
  description?: string;
};

export function ContextSheet({
  children,
  title = "Context",
  description,
}: ContextSheetProps) {
  const contextPanelOpen = useShellStore((state) => state.contextPanelOpen);
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);
  const belowLg = useMediaQuery("(max-width: 1023px)");

  if (children === undefined || !belowLg) {
    return null;
  }

  return (
    <Sheet
      open={contextPanelOpen}
      onOpenChange={(open) => {
        if (open) {
          openContextPanel();
        } else {
          closeContextPanel();
        }
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[70dvh] overflow-y-auto rounded-t-xl"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : (
            <SheetDescription className="sr-only">
              {title} details
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero(): React.ReactElement {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:pb-28 sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.92_0.02_250/_0.7),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.04_250/_0.45),transparent_55%)]"
      />
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-6 text-sm font-medium tracking-wide text-muted-foreground">
          DashNotes
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Your workspace knowledge, ready to answer
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Capture notes and files, then ask with citations — or let an agent
          search and write for you. Built for teams who need trustworthy AI on
          their own knowledge.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="h-11 px-6 text-sm" asChild>
            <Link href="/auth/register">Get started free</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-sm"
            asChild
          >
            <a href="#product">See how it works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

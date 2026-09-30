import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ClosingCta(): React.ReactElement {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/80 bg-muted/30 px-8 py-14 text-center sm:px-12">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Start with your workspace
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
          Create an account, add your notes, and ask your first question in
          minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="h-11 px-6" asChild>
            <Link href="/auth/register">Get started</Link>
          </Button>
          <Button size="lg" variant="ghost" className="h-11 px-6" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

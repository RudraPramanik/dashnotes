import Link from "next/link";

export function MarketingFooter(): React.ReactElement {
  return (
    <footer className="border-t border-border/60 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} DashNotes</p>
        <div className="flex gap-6">
          <Link href="/auth/login" className="hover:text-foreground">
            Log in
          </Link>
          <Link href="/auth/register" className="hover:text-foreground">
            Register
          </Link>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
        </div>
      </div>
    </footer>
  );
}

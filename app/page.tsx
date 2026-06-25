import { ThemeToggle } from "@/components/shell/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background font-sans">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-card sm:items-start">
        hello there
      </main>
    </div>
  );
}

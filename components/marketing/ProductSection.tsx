import { ProductMock } from "@/components/marketing/ProductMock";

const steps = [
  {
    title: "Notes & files",
    body: "Write and upload in one workspace. Knowledge stays organized and searchable.",
  },
  {
    title: "Chat with citations",
    body: "Ask questions and see which notes grounded the answer — trust, not guesswork.",
  },
  {
    title: "Agent that acts",
    body: "Let the workspace assistant search and create notes when you need more than a reply.",
  },
] as const;

export function ProductSection(): React.ReactElement {
  return (
    <section id="product" className="scroll-mt-20 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From capture to answer in one flow
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Notes, files, RAG chat, and an agent — designed as a product, not a
            pile of tools.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <ProductMock />
        </div>

        <ol className="mx-auto mt-16 grid max-w-4xl gap-10 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="text-left">
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlanId = "free" | "standard" | "max";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: readonly string[];
  highlighted?: boolean;
  cta: string;
};

const plans: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start capturing knowledge and try the basics.",
    features: [
      "Notes & notebooks",
      "File uploads",
      "Limited chat questions",
      "1 workspace",
    ],
    cta: "Start free",
  },
  {
    id: "standard",
    name: "Standard",
    price: "$29",
    period: "per seat / month",
    description: "Full RAG chat with citations for growing teams.",
    features: [
      "Everything in Free",
      "Unlimited chat with citations",
      "Priority indexing",
      "Member management",
    ],
    highlighted: true,
    cta: "Start Standard",
  },
  {
    id: "max",
    name: "Max",
    price: "$79",
    period: "per seat / month",
    description: "Agent workflows and higher limits for serious use.",
    features: [
      "Everything in Standard",
      "Workspace Agent",
      "Higher rate limits",
      "Priority support",
    ],
    cta: "Start Max",
  },
];

export function PricingSection(): React.ReactElement {
  return (
    <section id="pricing" className="scroll-mt-20 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple plans
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Display pricing for now — choose a plan and create your workspace.
            Billing connects later.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border border-border/80 bg-card p-6 sm:p-8",
                plan.highlighted &&
                  "border-foreground/20 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-foreground/10",
              )}
            >
              <h3 className="text-lg font-semibold text-foreground">
                {plan.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/50" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 h-10 w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href={`/auth/register?plan=${plan.id}`}>{plan.cta}</Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

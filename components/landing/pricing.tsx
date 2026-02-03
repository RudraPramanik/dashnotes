// components/landing/pricing.tsx

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Up to 50 knowledge items",
      "Basic AI summarization",
      "1 GB storage",
      "Standard search",
      "Community support",
    ],
    cta: "Get Started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    description: "For power users and professionals",
    features: [
      "Unlimited knowledge items",
      "Advanced AI features",
      "50 GB storage",
      "Semantic search",
      "Priority support",
      "Export & API access",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    description: "Collaboration for teams",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared knowledge bases",
      "Team analytics",
      "Admin controls",
      "SSO & advanced security",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "/register",
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section className="container py-20 lg:py-32">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-5xl">
          Simple, transparent pricing
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Choose the plan that's right for you. Always know what you'll pay.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "border-2 border-primary shadow-lg" : ""}
          >
            <CardHeader>
              {plan.highlighted && (
                <div className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "$0" && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
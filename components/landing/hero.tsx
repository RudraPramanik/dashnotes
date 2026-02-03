// components/landing/hero.tsx

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="container relative py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AI-Powered Knowledge Management</span>
        </div>

        {/* Main heading */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-7xl">
          Your Second Brain,
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>

        {/* Description */}
        <p className="mb-10 text-xl text-muted-foreground lg:text-2xl">
          Capture notes, save links, upload documents. Let AI organize,
          summarize, and help you find anything instantly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild className="group">
            <Link href="/register">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">See How It Works</Link>
          </Button>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-sm text-muted-foreground">
          No credit card required • Free forever plan available
        </p>
      </div>
    </section>
  )
}
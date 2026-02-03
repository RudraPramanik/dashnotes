// components/landing/features.tsx

import { Brain, Search, Zap, Lock, Share2, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "AI Summarization",
    description: "Automatically summarize long documents and articles with AI-powered insights.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find anything instantly with intelligent search that understands context.",
  },
  {
    icon: Zap,
    title: "Realtime Sync",
    description: "Your knowledge base stays in sync across all your devices in real-time.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your data is encrypted and secure. You own your knowledge.",
  },
  {
    icon: Share2,
    title: "Easy Organization",
    description: "Organize notes into projects and folders with tags and categories.",
  },
  {
    icon: FileText,
    title: "Multiple Formats",
    description: "Support for notes, links, PDFs, and various document types.",
  },
]

export function Features() {
  return (
    <section id="features" className="container py-20 lg:py-32">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-5xl">
          Everything you need to manage knowledge
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Powerful features designed to help you capture, organize, and retrieve
          information effortlessly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="border-2 transition-colors hover:border-primary/50">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
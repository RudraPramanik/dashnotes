
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
    
    <h3>welcome back</h3>
    </div>
  );
}


// app/page.tsx 

// import { Button } from "@/components/ui/button"
// import { Hero } from "@/components/landing/hero"
// import { Features } from "@/components/landing/features"
// import { Pricing } from "@/components/landing/pricing"
// import Link from "next/link"
// import { FileText } from "lucide-react"

// export default function LandingPage() {
//   return (
//     <div className="flex min-h-screen flex-col">
//       {/* Header */}
//       <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//         <div className="container flex h-16 items-center justify-between">
//           <Link href="/" className="flex items-center gap-2">
//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//               <FileText className="h-5 w-5" />
//             </div>
//             <span className="text-xl font-bold">KnowledgeBase</span>
//           </Link>

//           <nav className="hidden items-center gap-6 md:flex">
//             <Link
//               href="#features"
//               className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
//             >
//               Features
//             </Link>
//             <Link
//               href="#pricing"
//               className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
//             >
//               Pricing
//             </Link>
//             <Link
//               href="/login"
//               className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
//             >
//               Sign In
//             </Link>
//             <Button asChild size="sm">
//               <Link href="/register">Get Started</Link>
//             </Button>
//           </nav>

//           {/* Mobile menu button */}
//           <div className="flex items-center gap-2 md:hidden">
//             <Button variant="ghost" size="sm" asChild>
//               <Link href="/login">Sign In</Link>
//             </Button>
//             <Button size="sm" asChild>
//               <Link href="/register">Start</Link>
//             </Button>
//           </div>
//         </div>
//       </header>

//       {/* Main content */}
//       <main className="flex-1">
//         <Hero />
//         <Features />
        
//         <div id="pricing">
//           <Pricing />
//         </div>

//         {/* CTA Section */}
//         <section className="border-t bg-muted/50">
//           <div className="container py-20 text-center">
//             <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-5xl">
//               Ready to build your knowledge base?
//             </h2>
//             <p className="mb-8 text-lg text-muted-foreground">
//               Join thousands of users organizing their knowledge with AI
//             </p>
//             <Button size="lg" asChild>
//               <Link href="/register">Get Started Free</Link>
//             </Button>
//           </div>
//         </section>
//       </main>

//       {/* Footer */}
//       <footer className="border-t">
//         <div className="container py-8">
//           <div className="grid gap-8 md:grid-cols-4">
//             <div>
//               <div className="mb-4 flex items-center gap-2">
//                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//                   <FileText className="h-5 w-5" />
//                 </div>
//                 <span className="font-bold">KnowledgeBase</span>
//               </div>
//               <p className="text-sm text-muted-foreground">
//                 Your AI-powered personal knowledge management system.
//               </p>
//             </div>

//             <div>
//               <h3 className="mb-4 text-sm font-semibold">Product</h3>
//               <ul className="space-y-2 text-sm">
//                 <li>
//                   <Link href="#features" className="text-muted-foreground hover:text-foreground">
//                     Features
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
//                     Pricing
//                   </Link>
//                 </li>
//               </ul>
//             </div>

//             <div>
//               <h3 className="mb-4 text-sm font-semibold">Company</h3>
//               <ul className="space-y-2 text-sm">
//                 <li>
//                   <Link href="#" className="text-muted-foreground hover:text-foreground">
//                     About
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-muted-foreground hover:text-foreground">
//                     Blog
//                   </Link>
//                 </li>
//               </ul>
//             </div>

//             <div>
//               <h3 className="mb-4 text-sm font-semibold">Legal</h3>
//               <ul className="space-y-2 text-sm">
//                 <li>
//                   <Link href="#" className="text-muted-foreground hover:text-foreground">
//                     Privacy
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-muted-foreground hover:text-foreground">
//                     Terms
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           </div>

//           <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
//             © 2025 KnowledgeBase. All rights reserved.
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }
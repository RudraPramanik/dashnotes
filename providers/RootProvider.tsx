"use client"

import { QueryProvider } from "./QueryProvider"
import { ThemeProvider } from "./ThemeProvider"

type RootProviderProps = {
  children: React.ReactNode
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  )
}

"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { LoginModalHost } from "@/components/auth/login-modal-host"
import { LoginModalProvider } from "@/components/auth/login-modal-context"
import { DepositModalProvider } from "@/components/deposit/deposit-modal-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { APP_MODE } from "@/lib/app-mode"
import { AuthSessionProvider } from "@/lib/auth/auth-context"
import type { Session } from "@/lib/auth/types"
import type { RuntimeConfig } from "@/lib/runtime/config"
import { RuntimeConfigProvider } from "@/lib/runtime/runtime-context"
import { ThemeProvider } from "@/lib/theme/theme-context"
import type { Theme } from "@/lib/theme/types"

export function Providers({
  runtime,
  session,
  theme,
  children,
}: {
  runtime: RuntimeConfig
  session: Session
  theme: Theme
  children: ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: runtime.deterministic ? false : 1,
            refetchOnWindowFocus: !runtime.deterministic,
          },
        },
      }),
  )

  return (
    <RuntimeConfigProvider value={runtime}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider initialTheme={theme}>
          <AuthSessionProvider initialSession={session}>
            <TooltipProvider>
              <LoginModalProvider>
                <DepositModalProvider>
                  {children}
                  {APP_MODE ? null : <LoginModalHost />}
                </DepositModalProvider>
              </LoginModalProvider>
            </TooltipProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </RuntimeConfigProvider>
  )
}

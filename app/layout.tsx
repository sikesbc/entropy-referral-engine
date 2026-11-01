import type { Metadata, Viewport } from "next"
import { getServerSession, getSessionSide } from "@/lib/auth/server"
import { captureTime } from "@/lib/mock/fixtures"
import { isDeterministic } from "@/lib/runtime/env"
import { htmlThemeAttributes } from "@/lib/theme/types"
import { fontVariables } from "./fonts"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Entropy",
  icons: { icon: "/entropy-logo-white.svg" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [session, side] = await Promise.all([getServerSession(), getSessionSide()])
  const deterministic = isDeterministic()
  const runtime = {
    deterministic,
    frozenNow: deterministic ? await captureTime(side) : null,
  }
  const theme = session.status === "loggedin" ? session.user.theme : "dark"
  const themeAttributes = htmlThemeAttributes(theme)

  return (
    <html
      lang="en"
      className={[fontVariables, themeAttributes.className].filter(Boolean).join(" ")}
      data-theme={themeAttributes["data-theme"]}
      data-entropy-lite=""
      data-number-format="en-US"
      data-animations={deterministic ? "off" : undefined}
      suppressHydrationWarning
    >
      <body>
        <Providers runtime={runtime} session={session} theme={theme}>
          <div id="root">{children}</div>
        </Providers>
      </body>
    </html>
  )
}

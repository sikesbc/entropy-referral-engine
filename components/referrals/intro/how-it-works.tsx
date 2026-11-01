"use client"

import { Dialog } from "@base-ui/react/dialog"
import { CircleHelp } from "lucide-react"
import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { PanelContent } from "./how-it-works-content"
import { useIntro } from "./intro-store"
import { SideSheet } from "./side-sheet"
import { useReducedMotion } from "./use-reduced-motion"

export { SideSheet } from "./side-sheet"

const loadContent = () => import("./how-it-works-content")

const HowItWorksContent = lazy(() => loadContent().then((module) => ({ default: module.HowItWorksContent })))

function preloadContent() {
  void loadContent()
}

function Sheet(props: PanelContent) {
  return (
    <SideSheet title="How it works" description="You earn on every io trade your friends make.">
      <Suspense fallback={null}>
        <HowItWorksContent {...props} />
      </Suspense>
    </SideSheet>
  )
}

export function HowItWorksPill({
  className,
  defaultOpen = false,
  "data-tour": dataTour,
  ...content
}: PanelContent & { className?: string; defaultOpen?: boolean; "data-tour"?: string }) {
  const intro = useIntro()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(defaultOpen)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const previous = useRef(intro.phase)
  const hidden = intro.phase === "pending" || (intro.phase !== "rest" && intro.hosts > 0)

  useEffect(() => {
    const landed = previous.current === "flying" && intro.phase === "rest"
    previous.current = intro.phase
    if (!landed || reduced) return
    buttonRef.current?.animate(
      [{ boxShadow: "0 0 0 0 rgb(244 244 245 / 0.32)" }, { boxShadow: "0 0 0 0.6rem rgb(244 244 245 / 0)" }],
      { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    )
  }, [intro.phase, reduced])

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <Dialog.Trigger
        ref={buttonRef}
        data-tour={dataTour}
        onPointerEnter={preloadContent}
        onFocus={preloadContent}
        inert={hidden}
        aria-hidden={hidden}
        className={cn(
          "inline-flex h-[1.6rem] items-center gap-[0.4rem] rounded-full border border-white/[0.09] bg-[oklch(0.232_0.009_268)] pl-[0.55rem] pr-[0.75rem] text-[0.6875rem] text-ink-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(4_5_8/0.45)] outline-none transition-[opacity,color,border-color] duration-200 ease-out hover:border-white/[0.2] hover:text-ink focus-visible:border-white/[0.3] focus-visible:text-ink data-[popup-open]:border-white/[0.2] data-[popup-open]:text-ink",
          hidden ? "opacity-0" : "opacity-100",
          className,
        )}
      >
        <CircleHelp aria-hidden="true" className="size-[0.8rem] text-ink-quiet" strokeWidth={2} />
        How it works
      </Dialog.Trigger>
      <Sheet {...content} />
    </Dialog.Root>
  )
}

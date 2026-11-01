"use client"

import { Check, Copy, Download, Link2, LoaderCircle, Mail, MessageSquare, Send, Share } from "lucide-react"
import { useCallback, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { Popover as PopoverPrimitive, type PopoverRoot } from "@base-ui/react/popover"
import { emailShareUrl, shareData, smsShareUrl, telegramShareUrl, xShareUrl } from "@/lib/referral-site/share"
import { useCopy } from "../use-copy"

const ITEM_CLASS =
  "group/item flex h-10 w-full items-center gap-3 rounded-[0.5rem] px-3 text-left text-[0.8125rem] text-ink-soft outline-none transition-colors duration-150 ease-out hover:bg-panel-3 hover:text-ink focus-visible:bg-panel-3 focus-visible:text-ink"

const ICON_CLASS =
  "size-4 shrink-0 text-ink-quiet transition-colors duration-150 ease-out group-hover/item:text-ink"

export function subscribe(): () => void {
  return () => {}
}

export function canShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function"
}

export function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" />
    </svg>
  )
}

function ShareLink({
  href,
  icon,
  children,
  onPick,
}: {
  href: string
  icon: ReactNode
  children: string
  onPick: () => void
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onPick} className={ITEM_CLASS}>
      {icon}
      {children}
    </a>
  )
}

export function CopiedLabel({ copied, count, idle }: { copied: boolean; count: number; idle: string }) {
  if (!copied) return <span>{idle}</span>
  return (
    <span key={count} className="pass-pop items-center gap-1.5 text-up">
      <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
      Copied
    </span>
  )
}

function shareMarket(url: string): string | null {
  try {
    return new URL(url).searchParams.get("m")
  } catch {
    return null
  }
}

function inviteImagePath(code: string, market: string | null): string {
  const path = `/api/site/ticket/${encodeURIComponent(code)}`
  return market ? `${path}?m=${encodeURIComponent(market)}` : path
}

function inviteFileName(username: string, market: string | null): string {
  const suffix = market ? `-${market.toLowerCase()}` : ""
  return `entropy-invite-${username.replace(/[^\w-]+/g, "_")}${suffix}.png`
}

async function saveInviteImage(code: string, username: string, market: string | null): Promise<void> {
  const response = await fetch(inviteImagePath(code, market))
  if (!response.ok) throw new Error(`invite image ${response.status}`)
  const href = URL.createObjectURL(await response.blob())
  const link = document.createElement("a")
  link.href = href
  link.download = inviteFileName(username, market)
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(href), 1000)
}

export function SaveImage({
  url,
  code,
  username,
  onDone,
  className = ITEM_CLASS,
  iconClassName = ICON_CLASS,
  labelClassName,
}: {
  url: string
  code: string
  username: string
  onDone: () => void
  className?: string
  iconClassName?: string
  labelClassName?: string
}) {
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const market = shareMarket(url)
    setSaving(true)
    try {
      await saveInviteImage(code, username, market)
      onDone()
    } catch {
      window.open(inviteImagePath(code, market), "_blank", "noopener,noreferrer")
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void save()}
      disabled={saving}
      aria-busy={saving}
      aria-label="Download your pass image"
      className={className}
    >
      {saving ? (
        <LoaderCircle
          aria-hidden="true"
          className={`${iconClassName} animate-spin motion-reduce:animate-none`}
        />
      ) : (
        <Download aria-hidden="true" className={iconClassName} />
      )}
      <span className={labelClassName}>{saving ? "Downloading" : "Download"}</span>
    </button>
  )
}

const REPRINT_FRAMES: Keyframe[] = [
  { transform: "translateY(45%)", opacity: 0 },
  { transform: "translateY(0)", opacity: 1 },
]

const REPRINT_TIMING: KeyframeAnimationOptions = {
  duration: 220,
  delay: 110,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  fill: "backwards",
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function useTear() {
  const fillRef = useRef<HTMLSpanElement>(null)
  const nextId = useRef(0)
  const [tears, setTears] = useState<number[]>([])

  const tear = useCallback(() => {
    if (reducedMotion()) return
    nextId.current += 1
    const id = nextId.current
    setTears((list) => [...list.slice(-2), id])
    fillRef.current?.animate(REPRINT_FRAMES, REPRINT_TIMING)
  }, [])

  const settle = useCallback((id: number) => setTears((list) => list.filter((value) => value !== id)), [])

  return { fillRef, tears, tear, settle }
}

function StripLabel() {
  return (
    <>
      <Send aria-hidden="true" className="pass-strip-icon" />
      Share your link
    </>
  )
}

export type ShareControls = { open: () => void; strip: ReactNode }

export function ShareMenu({
  url,
  code,
  username,
  ticketRef,
  placement = "strip",
  children,
}: {
  url: string
  code: string
  username: string
  ticketRef: RefObject<HTMLElement | null>
  placement?: "strip" | "side"
  children: (controls: ShareControls) => ReactNode
}) {
  const side = placement === "side"
  const [open, setOpen] = useState(false)
  const supportsShare = useSyncExternalStore(subscribe, canShare, () => false)
  const { copied, count, copy } = useCopy()
  const { fillRef, tears, tear, settle } = useTear()
  const close = () => setOpen(false)
  const finish = () => {
    tear()
    close()
  }

  const change = (next: boolean, details: PopoverRoot.ChangeEventDetails) => {
    const target = details.event?.target
    if (
      !next &&
      details.reason === "outside-press" &&
      target instanceof Node &&
      ticketRef.current?.contains(target)
    ) {
      details.cancel()
      return
    }
    setOpen(next)
    if (next) tear()
  }

  const openMenu = () => {
    if (open) return
    setOpen(true)
    tear()
  }

  const nativeShare = async () => {
    finish()
    try {
      await navigator.share(shareData(url))
    } catch {
      return
    }
  }

  const strip = (
    <div className="pass-slot">
      <PopoverTrigger className="pass-strip">
        <span ref={fillRef} className="pass-strip-fill">
          <StripLabel />
        </span>
        <span aria-hidden="true" className="pass-strip-perf" />
      </PopoverTrigger>
      {tears.map((id) => (
        <span
          key={id}
          aria-hidden="true"
          className="pass-tear"
          onAnimationEnd={(event) => event.animationName === "pass-tear" && settle(id)}
        >
          <span className="pass-tear-face">
            <StripLabel />
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <Popover open={open} onOpenChange={change}>
      {children({ open: openMenu, strip })}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          anchor={side ? ticketRef : undefined}
          side={side ? "right" : "bottom"}
          align={side ? "center" : "start"}
          sideOffset={side ? 16 : 8}
          collisionAvoidance={side ? { side: "flip", align: "shift", fallbackAxisSide: "end" } : undefined}
          className="isolate z-50"
        >
          <PopoverPrimitive.Popup className="z-50 flex w-[14rem] origin-(--transform-origin) flex-col rounded-[0.75rem] bg-panel-2 p-1.5 text-ink shadow-[0_1.2rem_2.4rem_-0.8rem_rgb(0_0_0/0.7)] ring-1 ring-line outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=right]:slide-in-from-left-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <button
              type="button"
              onClick={() => {
                copy(url)
                tear()
              }}
              className={ITEM_CLASS}
            >
              {copied ? (
                <Check aria-hidden="true" className="size-4 shrink-0 text-up" />
              ) : (
                <Link2 aria-hidden="true" className={ICON_CLASS} />
              )}
              <CopiedLabel copied={copied} count={count} idle="Copy link" />
            </button>
            <ShareLink href={xShareUrl(url)} icon={<XMark className={ICON_CLASS} />} onPick={finish}>
              Post on X
            </ShareLink>
            <ShareLink
              href={telegramShareUrl(url)}
              icon={<Send aria-hidden="true" className={ICON_CLASS} />}
              onPick={finish}
            >
              Telegram
            </ShareLink>
            <ShareLink
              href={smsShareUrl(url)}
              icon={<MessageSquare aria-hidden="true" className={ICON_CLASS} />}
              onPick={finish}
            >
              Text message
            </ShareLink>
            <ShareLink
              href={emailShareUrl(url)}
              icon={<Mail aria-hidden="true" className={ICON_CLASS} />}
              onPick={finish}
            >
              Email
            </ShareLink>
            <span aria-hidden="true" className="mx-3 my-1 h-px bg-line-soft" />
            <SaveImage url={url} code={code} username={username} onDone={finish} />
            {supportsShare ? (
              <button type="button" onClick={() => void nativeShare()} className={ITEM_CLASS}>
                <Share aria-hidden="true" className={ICON_CLASS} />
                More apps
              </button>
            ) : null}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </Popover>
  )
}

export function CopyLinkIcon({ url }: { url: string }) {
  const { copied, count, copy } = useCopy()
  return (
    <button
      type="button"
      aria-label="Copy link"
      onClick={(event) => {
        event.stopPropagation()
        copy(url)
      }}
      className="relative -my-1.5 inline-flex h-7 shrink-0 items-center gap-1 rounded-[0.4rem] px-1.5 text-[0.625rem] font-medium text-[var(--ink)] opacity-60 outline-none transition-[opacity,background-color] duration-150 ease-out hover:bg-white/10 hover:opacity-100 focus-visible:bg-white/10 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/70 data-[copied=true]:opacity-100"
      data-copied={copied}
    >
      {copied ? (
        <span key={count} className="pass-pop items-center gap-1 text-up">
          <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
          <span role="status">Copied</span>
        </span>
      ) : (
        <Copy aria-hidden="true" className="size-3.5" />
      )}
    </button>
  )
}

const BAR_ITEM_CLASS =
  "group/item inline-flex h-10 shrink-0 items-center gap-1 rounded-full px-2 text-[0.8125rem] whitespace-nowrap text-ink-soft outline-none transition-colors duration-150 ease-out hover:bg-panel-2 hover:text-ink focus-visible:bg-panel-2 focus-visible:text-ink"

const BAR_ICON_CLASS =
  "size-4 shrink-0 text-ink-quiet transition-colors duration-150 ease-out group-hover/item:text-ink"

function BarLink({
  href,
  icon,
  children,
  label,
}: {
  href: string
  icon: ReactNode
  children: string
  label?: string
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={BAR_ITEM_CLASS}>
      {icon}
      <span className="pass-bar-label">{children}</span>
    </a>
  )
}

export function ShareBar({ url, code, username }: { url: string; code: string; username: string }) {
  const supportsShare = useSyncExternalStore(subscribe, canShare, () => false)
  const { copied, count, copy } = useCopy()

  const nativeShare = async () => {
    try {
      await navigator.share(shareData(url))
    } catch {
      return
    }
  }

  return (
    <div data-tour="share" className="pass-bar flex w-full min-w-0 items-center gap-x-0.5 overflow-x-auto">
      <button type="button" onClick={() => copy(url)} className="pass-copy mr-1 shrink-0">
        {copied ? (
          <Check aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.5} />
        ) : (
          <Link2 aria-hidden="true" className="size-4 shrink-0" />
        )}
        <span className="grid">
          <span aria-hidden="true" className="invisible [grid-area:1/1]">
            Copy link
          </span>
          {copied ? (
            <span key={count} role="status" className="pass-pop [grid-area:1/1]">
              Copied
            </span>
          ) : (
            <span className="[grid-area:1/1]">Copy link</span>
          )}
        </span>
      </button>
      <BarLink href={smsShareUrl(url)} icon={<MessageSquare aria-hidden="true" className={BAR_ICON_CLASS} />}>
        Text
      </BarLink>
      <BarLink href={xShareUrl(url)} icon={<XMark className={BAR_ICON_CLASS} />} label="Post on X">
        Post
      </BarLink>
      <BarLink href={emailShareUrl(url)} icon={<Mail aria-hidden="true" className={BAR_ICON_CLASS} />}>
        Email
      </BarLink>
      <BarLink href={telegramShareUrl(url)} icon={<Send aria-hidden="true" className={BAR_ICON_CLASS} />}>
        Telegram
      </BarLink>
      <SaveImage
        url={url}
        code={code}
        username={username}
        onDone={() => {}}
        className={BAR_ITEM_CLASS}
        iconClassName={BAR_ICON_CLASS}
        labelClassName="pass-bar-label"
      />
      {supportsShare ? (
        <button
          type="button"
          onClick={() => void nativeShare()}
          aria-label="More ways to share"
          className={BAR_ITEM_CLASS}
        >
          <Share aria-hidden="true" className={BAR_ICON_CLASS} />
          <span className="pass-bar-label">More</span>
        </button>
      ) : null}
    </div>
  )
}

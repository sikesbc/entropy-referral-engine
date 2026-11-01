"use client"

import { Check, Link2, Mail, MessageSquare, Send, Share } from "lucide-react"
import { useEffect, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react"
import { EmailAsk } from "@/components/referrals/email/email-ask"
import { displayUrl } from "@/lib/referral-site/config"
import { emailShareUrl, shareData, smsShareUrl, telegramShareUrl, xShareUrl } from "@/lib/referral-site/share"
import { useCopy } from "../use-copy"
import { canShare, SaveImage, subscribe, XMark } from "./share-menu"

const TILE_ICON = "pass-tile-icon"

function BackLink({
  href,
  icon,
  children,
  label,
  onPick,
}: {
  href: string
  icon: ReactNode
  children: string
  label?: string
  onPick: () => void
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onPick}
      aria-label={label}
      className="pass-tile"
    >
      {icon}
      <span className="pass-tile-label">{children}</span>
    </a>
  )
}

export function ShareBack({
  url,
  code,
  username,
  titleId,
  firstRef,
}: {
  url: string
  code: string
  username: string
  titleId: string
  firstRef: RefObject<HTMLButtonElement | null>
}) {
  const supportsShare = useSyncExternalStore(subscribe, canShare, () => false)
  const { copied, count, copy } = useCopy()
  const [shared, setShared] = useState(false)
  const mark = () => setShared(true)

  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true })
  }, [firstRef])

  const nativeShare = async () => {
    try {
      await navigator.share(shareData(url))
      mark()
    } catch {
      return
    }
  }

  return (
    <div className="pass-back-inner" data-shared={shared}>
      <div className="pass-back-head">
        <div className="flex min-w-0 flex-col gap-1">
          <span
            id={titleId}
            className="font-mono text-[0.5625rem] font-medium uppercase tracking-[0.22em] opacity-70"
          >
            Share your pass
          </span>
          <span className="truncate font-mono text-[0.6875rem] opacity-80">{displayUrl(url)}</span>
        </div>
      </div>
      <div className="pass-back-grid">
        <button
          ref={firstRef}
          type="button"
          onClick={() => {
            copy(url)
            mark()
          }}
          className="pass-tile"
          data-primary="true"
        >
          {copied ? (
            <Check aria-hidden="true" className={TILE_ICON} strokeWidth={2.5} />
          ) : (
            <Link2 aria-hidden="true" className={TILE_ICON} />
          )}
          {copied ? (
            <span key={count} role="status" className="pass-pop pass-tile-label">
              Copied
            </span>
          ) : (
            <span className="pass-tile-label">Copy link</span>
          )}
        </button>
        <BackLink
          href={smsShareUrl(url)}
          icon={<MessageSquare aria-hidden="true" className={TILE_ICON} />}
          onPick={mark}
        >
          Text message
        </BackLink>
        <BackLink
          href={xShareUrl(url)}
          icon={<XMark className={TILE_ICON} />}
          label="Post on X"
          onPick={mark}
        >
          Post
        </BackLink>
        <BackLink
          href={emailShareUrl(url)}
          icon={<Mail aria-hidden="true" className={TILE_ICON} />}
          onPick={mark}
        >
          Email
        </BackLink>
        <BackLink
          href={telegramShareUrl(url)}
          icon={<Send aria-hidden="true" className={TILE_ICON} />}
          onPick={mark}
        >
          Telegram
        </BackLink>
        <SaveImage
          url={url}
          code={code}
          username={username}
          onDone={mark}
          className="pass-tile"
          iconClassName={TILE_ICON}
          labelClassName="pass-tile-label"
        />
        {supportsShare ? (
          <button type="button" onClick={() => void nativeShare()} className="pass-tile">
            <Share aria-hidden="true" className={TILE_ICON} />
            <span className="pass-tile-label">More apps</span>
          </button>
        ) : null}
      </div>
      {shared ? (
        <div className="pass-back-ask">
          <EmailAsk />
        </div>
      ) : null}
    </div>
  )
}

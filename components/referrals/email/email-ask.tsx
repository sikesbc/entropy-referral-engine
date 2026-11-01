"use client"

import { LoaderCircle } from "lucide-react"
import {
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react"
import { cn } from "cn"
import { burst } from "@/components/referrals/intro/foil"
import { prefersReducedMotion } from "@/components/referrals/intro/use-reduced-motion"
import { useEmailSettings } from "./use-email-settings"

const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)"

export const EMAIL_FRAME_CLASS =
  "group/email relative isolate flex h-[2.1rem] w-full items-center gap-[0.35rem] rounded-full border border-[color-mix(in_srgb,var(--ink)_15%,transparent)] bg-[color-mix(in_srgb,var(--ink)_3.5%,transparent)] p-[0.2rem] pl-[0.85rem] shadow-[inset_0_1px_2px_rgb(0_0_0/0.32)] transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-[color-mix(in_srgb,var(--ink)_24%,transparent)] focus-within:border-[color-mix(in_srgb,var(--ink)_46%,transparent)] focus-within:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] focus-within:shadow-[inset_0_1px_2px_rgb(0_0_0/0.32),0_0_0_0.18rem_color-mix(in_srgb,var(--ink)_9%,transparent)] data-[state=invalid]:border-[color-mix(in_srgb,var(--color-down)_75%,transparent)] data-[state=invalid]:shadow-[inset_0_1px_2px_rgb(0_0_0/0.32),0_0_0_0.18rem_color-mix(in_srgb,var(--color-down)_16%,transparent)] data-[state=done]:border-transparent data-[state=done]:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] data-[state=done]:shadow-[0_0_18px_-4px_color-mix(in_srgb,var(--ink)_22%,transparent)]"

export const EMAIL_INPUT_CLASS =
  "h-full min-w-0 flex-1 border-0 !bg-transparent p-0 text-[0.75rem] !text-[var(--ink)] outline-none placeholder:!text-[color-mix(in_srgb,var(--ink)_40%,transparent)] read-only:cursor-default disabled:opacity-60"

export const METAL_BUTTON_CLASS =
  "relative inline-flex shrink-0 items-center justify-center gap-[0.3rem] overflow-hidden whitespace-nowrap rounded-full !bg-[linear-gradient(180deg,#f7f7f9_0%,#dfe0e5_52%,#babcc4_100%)] font-semibold !text-[#15161b] !shadow-[inset_0_1px_0_rgb(255_255_255/0.9),inset_0_-1px_0_rgb(20_22_30/0.22),0_1px_2px_rgb(8_9_12/0.45),0_4px_12px_-6px_rgb(8_9_12/0.6)] outline-none transition-[filter,transform,box-shadow] duration-150 ease-out hover:brightness-[1.05] active:translate-y-px active:brightness-[0.96] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--ink)_38%,transparent)] disabled:cursor-default"

export const QUIET_BUTTON_CLASS =
  "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full !bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] font-medium !text-[color-mix(in_srgb,var(--ink)_45%,transparent)] !shadow-none outline-none"

const FOIL_RING: CSSProperties = {
  background:
    "linear-gradient(110deg, rgb(255 255 255 / 0.85), rgb(178 204 255 / 0.55) 18%, rgb(255 255 255 / 0.18) 38%, rgb(220 196 255 / 0.6) 58%, rgb(186 255 232 / 0.4) 76%, rgb(255 255 255 / 0.9))",
  WebkitMask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
  padding: "1px",
}

type Status = "idle" | "saving" | "done" | "error" | "invalid"

export type EmailSave = (
  email: string,
  done: { onSuccess: () => void; onError: (message?: string) => void },
) => void

export function EmailCapture({
  question,
  success,
  failure,
  invalid = "Enter a valid email address.",
  action = "Notify me",
  save,
  onDone,
  className,
}: {
  question: string
  success: string
  failure: string
  invalid?: string
  action?: string
  save: EmailSave
  onDone?: (button: HTMLButtonElement) => void
  className?: string
}) {
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const checkRef = useRef<SVGPathElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const fromWidth = useRef(0)
  const inputId = useId()
  const errorId = useId()
  const done = status === "done"
  const problem = status === "error" || status === "invalid"
  const announce = useEffectEvent((button: HTMLButtonElement) => onDone?.(button))

  useLayoutEffect(() => {
    const button = buttonRef.current
    const check = checkRef.current
    if (!done || !button || !check) return
    announce(button)
    if (prefersReducedMotion()) {
      check.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out", fill: "both" })
      return
    }
    if (fromWidth.current > 0) {
      button.animate([{ width: `${fromWidth.current}px` }, { width: `${button.offsetWidth}px` }], {
        duration: 360,
        easing: EXPO,
      })
    }
    button.animate(
      [{ transform: "scale(0.82)" }, { transform: "scale(1.06)", offset: 0.55 }, { transform: "scale(1)" }],
      { duration: 520, delay: 120, easing: EXPO },
    )
    check.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: 440,
      delay: 200,
      easing: EXPO,
      fill: "both",
    })
    ringRef.current?.animate(
      [
        { opacity: 0, backgroundPosition: "0% 0" },
        { opacity: 1, offset: 0.3 },
        { opacity: 1, backgroundPosition: "100% 0" },
      ],
      { duration: 900, easing: EXPO, fill: "both" },
    )
  }, [done])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (status === "saving" || done) return
    if (!inputRef.current?.checkValidity() || value.trim() === "") {
      setStatus("invalid")
      setMessage(invalid)
      inputRef.current?.focus()
      return
    }
    setStatus("saving")
    setMessage(null)
    save(value.trim(), {
      onSuccess: () => {
        fromWidth.current = buttonRef.current?.offsetWidth ?? 0
        setStatus("done")
      },
      onError: (reason) => {
        setStatus("error")
        setMessage(reason ?? failure)
      },
    })
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-busy={status === "saving"}
      className={cn("flex flex-col gap-[0.55rem]", className)}
    >
      <div className="grid text-[0.75rem] leading-[1.45]">
        <label
          htmlFor={inputId}
          className={cn(
            "[grid-area:1/1] [text-wrap:balance] text-[color-mix(in_srgb,var(--ink)_72%,transparent)] transition-[opacity,visibility,transform] duration-[260ms] ease-out",
            done && "invisible -translate-y-[0.2rem] opacity-0",
          )}
        >
          {question}
        </label>
        <p
          role="status"
          className={cn(
            "[grid-area:1/1] [text-wrap:balance] font-medium !text-[var(--ink)] transition-[opacity,visibility,transform] duration-[260ms] ease-out",
            done ? "delay-[140ms]" : "invisible translate-y-[0.2rem] opacity-0",
          )}
        >
          {done ? success : null}
        </p>
      </div>
      <div
        className={EMAIL_FRAME_CLASS}
        data-state={done ? "done" : status === "invalid" ? "invalid" : undefined}
      >
        <span
          ref={ringRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -inset-px -z-10 rounded-full bg-[length:220%_100%] opacity-0",
            done && "opacity-100",
          )}
          style={FOIL_RING}
        />
        <input
          ref={inputRef}
          id={inputId}
          type="email"
          required
          autoComplete="email"
          spellCheck={false}
          placeholder="you@example.com"
          value={value}
          readOnly={done}
          aria-label={done ? "Email address" : undefined}
          aria-invalid={status === "invalid" || undefined}
          aria-describedby={problem ? errorId : undefined}
          onChange={(event) => {
            setValue(event.target.value)
            if (problem) {
              setStatus("idle")
              setMessage(null)
            }
          }}
          className={EMAIL_INPUT_CLASS}
        />
        <button
          ref={buttonRef}
          type="submit"
          disabled={status === "saving" || done}
          aria-label={done ? "Saved" : status === "saving" ? "Saving" : undefined}
          className={cn(
            METAL_BUTTON_CLASS,
            "h-full text-[0.6875rem]",
            done ? "aspect-square px-0" : "px-[0.8rem]",
          )}
        >
          {done ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[0.8rem]">
              <path
                ref={checkRef}
                d="M5 12.5l4.4 4.4L19 7.2"
                pathLength={1}
                strokeDasharray={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span className="grid place-items-center">
              <span className={cn("[grid-area:1/1]", status === "saving" && "invisible")}>{action}</span>
              {status === "saving" ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-[0.8rem] animate-spin [grid-area:1/1] motion-reduce:animate-none"
                  strokeWidth={2.6}
                />
              ) : null}
            </span>
          )}
        </button>
      </div>
      {problem && message ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-[0.4rem] pl-[0.85rem] text-[0.6875rem] leading-[1.45] !text-[color-mix(in_srgb,var(--color-down)_80%,var(--ink))]"
        >
          <span aria-hidden="true" className="size-[0.3rem] shrink-0 rounded-full bg-[var(--color-down)]" />
          {message}
        </p>
      ) : null}
    </form>
  )
}

export function EmailAsk({ className, onSaved }: { className?: string; onSaved?: (email: string) => void }) {
  const { settings, save } = useEmailSettings()
  const [held, setHeld] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)

  if (!held && settings?.email && settings.subscribed) return null

  const send: EmailSave = (email, done) => {
    setHeld(true)
    save.mutate(
      { email },
      {
        onSuccess: (saved) => {
          done.onSuccess()
          if (saved.email) onSaved?.(saved.email)
        },
        onError: (error) => done.onError(error.message),
      },
    )
  }

  return (
    <div
      ref={hostRef}
      onFocusCapture={() => setHeld(true)}
      className={cn("relative max-w-[24rem]", className)}
    >
      <EmailCapture
        question="Want to know when they join?"
        success="Done. We’ll email you when they join."
        failure="Couldn’t save that. Try again."
        save={send}
        onDone={(button) => {
          if (hostRef.current && !prefersReducedMotion()) burst(hostRef.current, button)
        }}
      />
    </div>
  )
}

"use client"

import { useState, type FormEvent } from "react"
import { cn } from "cn"
import { EMAIL_FRAME_CLASS, EMAIL_INPUT_CLASS, METAL_BUTTON_CLASS, QUIET_BUTTON_CLASS } from "./email-ask"
import { useEmailSettings, type EmailPrefs } from "./use-email-settings"

const SWITCHES: { key: keyof EmailPrefs; label: string }[] = [
  { key: "joined", label: "A friend joins through my link" },
  { key: "firstTrade", label: "A friend makes their first trade" },
  { key: "unlock", label: "I unlock a market" },
  { key: "boost", label: "Entropy boosts a market" },
  { key: "weeklyOnly", label: "Weekly summary only" },
]

function Switch({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  disabled: boolean
  label: string
  onChange: (value: boolean) => void
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-4 border-b border-line-soft py-[0.7rem] text-[0.8125rem] transition-colors duration-150",
        checked ? "text-ink" : "text-ink-soft",
        disabled ? "opacity-50" : "cursor-pointer",
      )}
    >
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-[1.1rem] w-[1.9rem] shrink-0 rounded-full outline-none transition-[background-color,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-panel",
          checked
            ? "bg-[linear-gradient(180deg,#eceef2_0%,#c9cbd2_60%,#a9acb5_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.8),0_1px_2px_rgb(4_5_8/0.5)]"
            : "bg-panel-3 shadow-[inset_0_1px_2px_rgb(4_5_8/0.55),inset_0_0_0_1px_rgb(255_255_255/0.05)]",
        )}
      >
        <span
          className={cn(
            "absolute left-[0.15rem] top-[0.15rem] size-[0.8rem] rounded-full transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            checked
              ? "translate-x-[0.8rem] bg-[#1a1c23] shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(4_5_8/0.4)]"
              : "bg-ink-quiet shadow-[0_1px_2px_rgb(4_5_8/0.5)]",
          )}
        />
      </button>
    </label>
  )
}

export function EmailPreferences({ className }: { className?: string }) {
  const { settings, loading, save } = useEmailSettings()
  const [draft, setDraft] = useState<string | null>(null)
  const email = draft ?? settings?.email ?? ""
  const active = Boolean(settings?.email && settings.subscribed)
  const paused = Boolean(settings?.email && !settings.subscribed)
  const idle = active && draft === null
  const blocked = save.isPending || loading || idle

  function submit(event: FormEvent) {
    event.preventDefault()
    save.mutate({ email }, { onSuccess: () => setDraft(null) })
  }

  return (
    <section
      id="email"
      aria-labelledby="email-heading"
      className={cn("flex flex-col gap-[0.9rem]", className)}
    >
      <h2 id="email-heading" className="text-[0.9375rem] font-medium text-ink">
        Email me when…
      </h2>
      <form onSubmit={submit} aria-busy={save.isPending} className="flex flex-col gap-[0.5rem]">
        <div className={EMAIL_FRAME_CLASS} data-state={save.error ? "invalid" : undefined}>
          <input
            type="email"
            required
            aria-label="Email address"
            autoComplete="email"
            spellCheck={false}
            placeholder="you@example.com"
            value={email}
            disabled={loading}
            onChange={(event) => setDraft(event.target.value)}
            className={EMAIL_INPUT_CLASS}
          />
          <button
            type="submit"
            disabled={blocked}
            className={cn(
              blocked ? QUIET_BUTTON_CLASS : METAL_BUTTON_CLASS,
              "h-full px-[0.85rem] text-[0.6875rem]",
            )}
          >
            {paused ? "Turn on" : "Save"}
          </button>
        </div>
        {paused && (
          <p className="pl-[0.85rem] text-[0.75rem] text-ink-quiet">
            You unsubscribed. Press Turn on to get emails again.
          </p>
        )}
        {save.error && (
          <p
            role="alert"
            className="flex items-center gap-[0.4rem] pl-[0.85rem] text-[0.75rem] text-[color-mix(in_srgb,var(--color-down)_80%,var(--ink))]"
          >
            <span aria-hidden="true" className="size-[0.3rem] shrink-0 rounded-full bg-[var(--color-down)]" />
            {save.error.message}
          </p>
        )}
      </form>
      <div className="mt-[0.4rem] flex flex-col border-t border-line-soft">
        {SWITCHES.map(({ key, label }) => (
          <Switch
            key={key}
            label={label}
            checked={settings?.prefs[key] ?? false}
            disabled={!active || save.isPending}
            onChange={(value) => save.mutate({ prefs: { [key]: value } })}
          />
        ))}
      </div>
    </section>
  )
}

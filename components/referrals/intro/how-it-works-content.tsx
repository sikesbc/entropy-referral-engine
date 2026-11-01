"use client"

import { Accordion } from "@base-ui/react/accordion"
import Big from "big.js"
import { Plus } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import { anthSkin, mainSkin, nvdaSkin } from "@/components/site/referrals/pass/skins"
import { MarketPassStyles } from "@/components/site/referrals/market-passes"
import { humane } from "@/components/onboarding/humane-font"
import { ENTROPY_SHARE, REFERRER_SHARE } from "@/lib/referral-site/config"
import { formatExactUsd, formatPercent } from "@/lib/referral-site/format"
import type { DecimalString } from "@/lib/referral-site/types"
import { cn } from "@/lib/utils"
import {
  EXAMPLE_FEE_USD,
  PANEL_EXAMPLE,
  PANEL_FAQ,
  PANEL_FINE_PRINT,
  PANEL_RATES,
  PANEL_RATES_NOTE,
  PANEL_STEPS,
  type PanelRateKind,
} from "./intro-copy"

type Rates = { entropyShare: DecimalString; referrerShare: DecimalString }

export type PanelContent = { rates?: Rates }

const DEFAULT_RATES: Rates = { entropyShare: ENTROPY_SHARE, referrerShare: REFERRER_SHARE }

const HUMANE: CSSProperties = { fontFamily: humane.style.fontFamily }

const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]"

const SWATCH_SKINS = {
  base: { skin: mainSkin, state: "unlocked" },
  unlocked: { skin: nvdaSkin, state: "unlocked" },
  boosted: { skin: anthSkin, state: "boosted" },
} as const

function Label({ children }: { children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-[0.7rem] font-mono text-[0.5625rem] uppercase tracking-[0.24em] text-ink-quiet">
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-white/[0.07]" />
    </h3>
  )
}

function Swatch({ kind }: { kind: PanelRateKind }) {
  const { skin, state } = SWATCH_SKINS[kind]
  const Art = skin.Art
  return (
    <span
      aria-hidden="true"
      className="relative block w-[3.5rem] shrink-0 [aspect-ratio:34/20] [container-type:inline-size] drop-shadow-[0_0.3rem_0.4rem_rgb(0_0_0/0.5)]"
    >
      <span className="pass-card market-pass" data-skin={skin.id} data-state={state}>
        <span className="market-scale">
          <span className="pass-ticket">
            <span className="pass-face pass-body">
              <Art part="body" />
              <span className="pass-sheen" />
            </span>
            <span className="pass-face pass-stub">
              <Art part="stub" />
              <span className="pass-perf" />
              <span className="pass-sheen" />
            </span>
          </span>
        </span>
      </span>
    </span>
  )
}

function Steps() {
  return (
    <ol className="flex flex-col gap-[1.15rem]">
      {PANEL_STEPS.map(({ title, text }, index) => (
        <li key={title} className="grid grid-cols-[1.5rem_1fr] gap-x-[0.5rem]">
          <span className="pt-[0.2rem] font-mono text-[0.625rem] tabular-nums tracking-[0.08em] text-ink-ghost">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex flex-col gap-[0.25rem]">
            <span className="text-[0.9375rem] font-semibold leading-[1.3] tracking-[-0.005em] text-ink">
              {title}
            </span>
            <span className="leading-[1.5] text-ink-quiet [text-wrap:pretty]">{text}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

function RateTable() {
  return (
    <section className="flex flex-col gap-[0.9rem]">
      <Label>Your rates</Label>
      <ul className="flex flex-col">
        {PANEL_RATES.map(({ kind, rate, market, friends }) => (
          <li
            key={kind}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-x-[0.85rem] border-b border-white/[0.06] py-[0.7rem] first:pt-[0.2rem]"
          >
            <Swatch kind={kind} />
            <span className="flex min-w-0 flex-col gap-[0.15rem]">
              <span className="text-ink">{market}</span>
              <span className="text-[0.75rem] leading-[1.35] text-ink-quiet">{friends}</span>
            </span>
            <span
              className={cn(
                "text-[1.9rem] font-semibold leading-none tabular-nums",
                kind === "base" ? "text-ink-soft" : "text-ink",
              )}
              style={HUMANE}
            >
              {rate}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[0.75rem] leading-[1.5] text-ink-quiet [text-wrap:pretty]">{PANEL_RATES_NOTE}</p>
    </section>
  )
}

function ReceiptLine({
  label,
  value,
  tone = "quiet",
}: {
  label: string
  value: string
  tone?: "quiet" | "ink" | "up"
}) {
  return (
    <div className="flex items-baseline gap-[0.45rem]">
      <dt className={tone === "quiet" ? "text-ink-quiet" : "text-ink-soft"}>{label}</dt>
      <span
        aria-hidden="true"
        className="min-w-[0.5rem] flex-1 -translate-y-[0.25em] border-b border-dotted border-white/[0.14]"
      />
      <dd
        className={cn(tone === "up" ? "font-medium text-up" : tone === "ink" ? "text-ink" : "text-ink-soft")}
      >
        {value}
      </dd>
    </div>
  )
}

function Example({ rates }: { rates: Rates }) {
  const entropy = new Big(EXAMPLE_FEE_USD).times(rates.entropyShare)
  return (
    <section className="flex flex-col gap-[0.9rem]">
      <Label>Example</Label>
      <p className="leading-[1.5] text-ink-soft [text-wrap:pretty]">{PANEL_EXAMPLE.intro}</p>
      <div className="rounded-[0.5rem] bg-[rgb(6_7_10/0.35)] px-[0.8rem] py-[0.65rem] font-mono text-[0.65rem] leading-[1.8] tabular-nums shadow-[inset_0_1px_2px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(255_255_255/0.035)]">
        <p className="mb-[0.15rem] text-ink-soft">{PANEL_EXAMPLE.trade}</p>
        <dl>
          <ReceiptLine label={PANEL_EXAMPLE.fee} value={formatExactUsd(EXAMPLE_FEE_USD)} />
          <ReceiptLine
            label={`${PANEL_EXAMPLE.entropy}, ${formatPercent(rates.entropyShare)}`}
            value={formatExactUsd(entropy.toFixed())}
          />
        </dl>
        <p className="mt-[0.35rem] border-t border-dashed border-white/[0.12] pt-[0.35rem] text-ink-soft">
          {PANEL_EXAMPLE.yours}
        </p>
        <dl>
          {PANEL_EXAMPLE.rows.map(({ market, rate }) => (
            <ReceiptLine
              key={market}
              label={`${market}, ${formatPercent(rate)}`}
              value={formatExactUsd(entropy.times(rate).toFixed())}
              tone="up"
            />
          ))}
        </dl>
      </div>
      <p className="text-[0.75rem] leading-[1.5] text-ink-quiet">{PANEL_EXAMPLE.outro}</p>
    </section>
  )
}

function Faq() {
  return (
    <section className="flex flex-col gap-[0.35rem]">
      <Label>Questions</Label>
      <Accordion.Root multiple={false} className="flex flex-col">
        {PANEL_FAQ.map(({ question, answer }) => (
          <Accordion.Item key={question} className="group/item border-b border-white/[0.06]">
            <Accordion.Header className="m-0">
              <Accordion.Trigger className="group -mx-[0.5rem] flex w-[calc(100%+1rem)] items-center justify-between gap-4 rounded-[0.45rem] px-[0.5rem] py-[0.75rem] text-left leading-[1.4] text-ink-soft outline-none transition-colors duration-150 hover:text-ink focus-visible:bg-white/[0.04] focus-visible:text-ink data-[panel-open]:text-ink">
                {question}
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-[1.15rem] shrink-0 place-items-center rounded-full border border-white/[0.1] text-ink-quiet transition-[transform,background-color,border-color,color] duration-300 motion-reduce:transition-none",
                    EASE,
                    "group-hover:border-white/[0.2] group-hover:text-ink-soft group-focus-visible:border-white/[0.28]",
                    "group-data-[panel-open]:rotate-45 group-data-[panel-open]:border-transparent group-data-[panel-open]:bg-[linear-gradient(180deg,#f3f4f7_0%,#d5d7de_55%,#aeb1ba_100%)] group-data-[panel-open]:text-[#17181d]",
                  )}
                >
                  <Plus className="size-[0.65rem]" strokeWidth={2.5} />
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel
              className={cn(
                "h-[var(--accordion-panel-height)] overflow-hidden transition-[height,opacity] duration-300 data-[ending-style]:h-0 data-[ending-style]:opacity-0 data-[starting-style]:h-0 data-[starting-style]:opacity-0 motion-reduce:transition-none",
                EASE,
              )}
            >
              <p className="pb-[0.85rem] pr-[1.8rem] leading-[1.55] text-ink-quiet [text-wrap:pretty]">
                {answer}
              </p>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  )
}

function FinePrint() {
  return (
    <section className="flex flex-col gap-[0.7rem]">
      <Label>Fine print</Label>
      <ul className="flex flex-col gap-[0.35rem] text-[0.75rem] leading-[1.5] text-ink-quiet">
        {PANEL_FINE_PRINT.map((rule) => (
          <li key={rule} className="flex gap-[0.55rem]">
            <span aria-hidden="true" className="text-ink-ghost">
              ·
            </span>
            {rule}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function HowItWorksContent({ rates = DEFAULT_RATES }: PanelContent) {
  return (
    <div className="flex flex-col text-[0.8125rem]">
      <MarketPassStyles />
      <Steps />
      <div className="mt-[2.4rem]">
        <RateTable />
      </div>
      <div className="mt-[2.4rem]">
        <Example rates={rates} />
      </div>
      <div className="mt-[2.6rem]">
        <Faq />
      </div>
      <div className="mt-[2.2rem]">
        <FinePrint />
      </div>
    </div>
  )
}

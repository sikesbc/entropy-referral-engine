import { INTRO_COPY, INTRO_WORKED_LINE } from "./intro-copy"
import type { IntroStep } from "./intro-tour"

export const TICKET_TOUR_TARGET = '[data-tour="ticket"]'
export const FRIENDS_TOUR_TARGET = '[data-tour="friends"]'
export const MARKETS_TOUR_TARGET = '[data-tour="markets"]'
export const BOOST_TOUR_TARGET = '[data-tour="boost"]'
export const EARNINGS_TOUR_TARGET = '[data-tour="earnings"]'
export const FIRST_SHARE_TOUR_TARGET = '[data-tour="first-share"]'
export const SHARE_TOUR_TARGET = '[data-tour="share"]'
export const FINALE_TOUR_TARGET = `${TICKET_TOUR_TARGET}, ${SHARE_TOUR_TARGET}`

export const INTRO_STEPS: IntroStep[] = [
  { target: TICKET_TOUR_TARGET, ...INTRO_COPY.ticket },
  { target: FRIENDS_TOUR_TARGET, ...INTRO_COPY.friends, detail: INTRO_WORKED_LINE },
  { target: MARKETS_TOUR_TARGET, ...INTRO_COPY.markets },
  { target: BOOST_TOUR_TARGET, ...INTRO_COPY.boost, fallback: EARNINGS_TOUR_TARGET, floating: true },
  {
    target: FINALE_TOUR_TARGET,
    ...INTRO_COPY.firstShare,
    action: true,
    slot: "share",
    when: FIRST_SHARE_TOUR_TARGET,
  },
  { target: FINALE_TOUR_TARGET, ...INTRO_COPY.shareAgain, action: true, slot: "share" },
]

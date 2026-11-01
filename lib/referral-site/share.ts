const INTRO = "I trade io markets on Entropy. Sign up with my link:"
const EMAIL_SUBJECT = "Trade io markets on Entropy"

export function shareMessage(url: string): string {
  return `${INTRO} ${url}`
}

export function xShareUrl(url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(shareMessage(url))}`
}

export function telegramShareUrl(url: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(INTRO)}`
}

export function smsShareUrl(url: string): string {
  return `sms:?&body=${encodeURIComponent(shareMessage(url))}`
}

export function emailShareUrl(url: string): string {
  return `mailto:?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(shareMessage(url))}`
}

export function shareData(url: string): ShareData {
  return { title: "Entropy", text: INTRO, url }
}

export const NUDGE_MESSAGE =
  "Your Entropy account is ready. Trade OpenAI, Nvidia and more on io: https://entropy.io/trade"

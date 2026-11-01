import { cn } from "@/lib/utils"

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

function rollingChars(text: string) {
  return Array.from(text).map((char, index) =>
    /\d/.test(char) ? (
      <span key={index} className="lite-roll-digit">
        <span className="lite-roll-strip" style={{ transform: `translateY(-${Number(char) * 10}%)` }}>
          {DIGITS.map((digit) => (
            <i key={digit}>{digit}</i>
          ))}
        </span>
      </span>
    ) : (
      <span key={index} className="lite-roll-char">
        {char}
      </span>
    ),
  )
}

export function RollingPrice({
  text,
  sheen = false,
  className,
}: {
  text: string
  sheen?: boolean
  className?: string
}) {
  const dot = text.lastIndexOf(".")
  const whole = dot < 0 ? text : text.slice(0, dot)
  const fraction = dot < 0 ? "" : text.slice(dot)
  return (
    <span className={cn("lite-price", sheen && "lite-price-sheen", className)}>
      <span className="sr-only">{text}</span>
      <span className="lite-price-whole" aria-hidden="true">
        {rollingChars(whole)}
      </span>
      {fraction ? (
        <span className="lite-price-fraction" aria-hidden="true">
          {rollingChars(fraction)}
        </span>
      ) : null}
    </span>
  )
}

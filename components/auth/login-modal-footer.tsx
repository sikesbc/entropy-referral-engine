import { cn } from "@/lib/utils"
import { PRIVY_ACCENT_TEXT, PRIVY_MUTED_TEXT } from "./privy-styles"

export function LoginModalFooter({
  underlineLinks,
  className,
}: {
  underlineLinks: boolean
  className?: string
}) {
  const linkClass = cn(PRIVY_ACCENT_TEXT, underlineLinks && "underline")
  return (
    <div id="privy-content-footer-container" className={cn("shrink-0 px-[16px]", className)}>
      <p className={cn("m-0 block text-center text-[13px] leading-[20px]", PRIVY_MUTED_TEXT)}>
        By logging in I agree to the <span className={linkClass}>Terms</span> &amp;{" "}
        <span className={linkClass}>Privacy Policy</span>
      </p>
      <div className="flex items-center justify-center pt-[16px] pb-[8px] text-[13px] leading-[20px]">
        <span
          id="protected-by-privy"
          role="img"
          aria-label="Protected by Privy"
          className={cn("block py-[8px]", PRIVY_MUTED_TEXT)}
        >
          <span
            aria-hidden="true"
            className="block h-[13px] w-[150px] bg-current [mask:url(/auth/protected-by-privy.svg)_center/contain_no-repeat]"
          />
        </span>
      </div>
    </div>
  )
}

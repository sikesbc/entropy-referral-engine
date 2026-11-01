import { ArrowLeft, X } from "lucide-react"
import { PRIVY_TEXT } from "./privy-styles"
import { cn } from "@/lib/utils"

const HEADER_BUTTON_CLASS =
  "flex size-[24px] cursor-pointer items-center justify-center rounded-full p-[4px] opacity-60 outline-none transition-opacity hover:opacity-100 focus-visible:opacity-100"

export function LoginModalHeader({ onBack, onClose }: { onBack?: () => void; onClose: () => void }) {
  return (
    <div className="flex h-[56px] shrink-0 items-center justify-between px-[16px]">
      {onBack ? (
        <button
          type="button"
          aria-label="Go back"
          onClick={onBack}
          className={cn(HEADER_BUTTON_CLASS, PRIVY_TEXT)}
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      ) : (
        <span className="size-[24px]" />
      )}
      <button
        type="button"
        aria-label="close modal"
        onClick={onClose}
        className={cn(HEADER_BUTTON_CLASS, PRIVY_TEXT)}
      >
        <X size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}

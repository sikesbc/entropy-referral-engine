"use client"

import { Moon } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/lib/theme/theme-context"
import { cn } from "@/lib/utils"
import { ACCOUNT_MENU_ITEM_CLASS } from "./account-menu-styles"

export function DarkModeMenuItem() {
  const { theme, setTheme } = useTheme()
  const dark = theme === "dark"
  return (
    <DropdownMenuItem
      className={ACCOUNT_MENU_ITEM_CLASS}
      closeOnClick={false}
      role="menuitemcheckbox"
      aria-checked={dark}
      onClick={() => setTheme(dark ? "light" : "dark", { persist: true })}
    >
      <Moon size="0.875rem" aria-hidden="true" />
      Dark mode
      <span
        aria-hidden="true"
        className={cn(
          "ml-auto flex h-4 w-7 items-center rounded-full p-0.5 transition-colors",
          dark ? "bg-ink" : "bg-line",
        )}
      >
        <span
          className={cn(
            "size-3 rounded-full bg-panel shadow-sm transition-transform",
            dark && "translate-x-3",
          )}
        />
      </span>
    </DropdownMenuItem>
  )
}

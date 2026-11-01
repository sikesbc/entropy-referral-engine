"use client"

import { Search } from "lucide-react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { SearchMarketsPanel } from "./search-markets-panel"

export function SearchMarkets() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  if (openedOn !== null && openedOn !== pathname) {
    setOpenedOn(null)
    setOpen(false)
    setQuery("")
  }

  const openSearch = () => {
    setOpen(true)
    setOpenedOn(pathname)
  }

  const close = useCallback(() => {
    setOpen(false)
    inputRef.current?.blur()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const typing = target?.closest('input, textarea, select, [contenteditable="true"]')
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  return (
    <div ref={containerRef}>
      <label className="relative hidden sm:block">
        <Search
          size="0.875rem"
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-quiet"
        />
        <input
          ref={inputRef}
          value={query}
          placeholder="Search"
          aria-label="Search markets"
          aria-expanded={open}
          aria-controls="market-search-panel"
          onFocus={openSearch}
          onClick={openSearch}
          onChange={(event) => {
            setQuery(event.target.value)
            openSearch()
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") close()
          }}
          className="h-7 w-[9rem] rounded-[0.4375rem] bg-panel-2 pl-8 pr-7 text-[0.8125rem] text-ink outline-none transition-[width] duration-200 placeholder:text-ink-quiet focus:w-[12rem] dark:bg-panel-3"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[0.6875rem] text-ink-quiet">
          /
        </kbd>
      </label>
      <button
        type="button"
        aria-label="Search markets"
        onClick={() => (open ? setOpen(false) : openSearch())}
        className="inline-flex h-7 w-7 items-center justify-center rounded-[0.4375rem] bg-panel-2 text-ink-soft sm:hidden dark:bg-panel-3"
      >
        <Search size="0.875rem" aria-hidden="true" />
      </button>
      {open ? (
        <SearchMarketsPanel query={query} onQuery={setQuery} inputRef={inputRef} onClose={close} />
      ) : null}
    </div>
  )
}

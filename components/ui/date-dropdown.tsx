"use client"

import React, { useEffect, useRef, useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"

type DateDropdownProps = {
  options?: string[]
  // dataset is a more reusable shape used across the app: array of { label, value }
  dataset?: { label: string; value: string }[]
  selected?: string
  defaultSelected?: string
  onSelect?: (value: string) => void
  showOptions?: boolean // when false, dropdown content won't render
  className?: string
  triggerClassName?: string
  menuClassName?: string
  placeholder?: string
}

export function DateDropdown({
  options = [],
  dataset,
  selected,
  defaultSelected,
  onSelect,
  showOptions = true,
  className,
  triggerClassName,
  menuClassName,
  placeholder = "Select",
}: DateDropdownProps) {
  const [open, setOpen] = useState(false)
  const [internalSelected, setInternalSelected] = useState<string | undefined>(
    selected ?? defaultSelected
  )
  const ref = useRef<HTMLDivElement | null>(null)

  // allow controlled selected -> sync
  useEffect(() => {
    if (selected !== undefined) setInternalSelected(selected)
  }, [selected])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [])

  function handleSelect(value: string) {
    if (selected === undefined) setInternalSelected(value)
    onSelect?.(value)
    setOpen(false)
  }

  // Determine display text. If a dataset is provided, look up the label by value.
  let display = internalSelected ?? placeholder
  if (dataset && internalSelected) {
    const found = dataset.find((d) => d.value === internalSelected || d.label === internalSelected)
    if (found) display = found.label
  }

  // root wrapper: block and full width on small screens; allow override via className
  const wrapperClass = `${className ?? ''} block w-full lg:inline-block`

  return (
    <div className={wrapperClass} ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        // trigger is full width on mobile, auto on lg+. justify-between keeps icon and label spaced.
        className={"flex items-center justify-between w-full lg:w-auto bg-white px-3 py-2 rounded-md shadow-sm space-x-2 text-sm text-gray-700 " + (triggerClassName ?? "")}
      >
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span className="truncate">{display}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-600 ml-2" />
      </button>

      {open && showOptions && (
        <div className={"absolute left-0 mt-2 w-full lg:w-48 bg-white border border-gray-100 rounded-md shadow-lg z-20 " + (menuClassName ?? "")}>
          <ul className="py-1">
            {/* If a dataset is passed, render dataset items (label/value). Otherwise render simple options strings. */}
            {dataset ? (
              dataset.map((d) => (
                <li key={d.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(d.value)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                  >
                    {d.label}
                  </button>
                </li>
              ))
            ) : (
              options.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => handleSelect(o)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                  >
                    {o}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default DateDropdown

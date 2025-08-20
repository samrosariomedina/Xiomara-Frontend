"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface Action {
  icon?: React.ReactNode
  label: string
  ariaLabel?: string
  onClick?: () => void
  variant?: "soft" | "outline" | "solid"
}

interface HeaderControlsProps {
  title: string
  actions?: Action[]
}

export function HeaderControls({ title, actions = [] }: HeaderControlsProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (menuRef.current.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="hidden md:hidden lg:block text-lg  font-medium text-gray-900">{title}</h2>

      {/* Desktop / tablet actions */}
      {actions.length > 0 && (
        <div className="hidden sm:flex items-center space-x-2">
          {actions.map((a, i) => {
          const key = `${a.label}-${i}`
          if (a.variant === "soft") {
            return (
              <button
                key={key}
                onClick={a.onClick}
                aria-label={a.ariaLabel || a.label}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#f7f9ff] text-[#31499f] text-sm hover:bg-[#eef2ff]"
              >
                {a.icon}
                <span className="hidden sm:inline">{a.label}</span>
              </button>
            )
          }

          // outline or solid use the shared Button component for consistent look
          const btnClass =
            a.variant === "solid"
              ? "bg-[#f7f9ff] hover:bg-[#e7e9ff] text-[#31499f] rounded-full px-3 py-1.5 text-sm"
              : "inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#f7f9ff]  text-[#31499f] hover:bg-[#e7e9ff] text-sm"

          return (
            <Button key={key} onClick={a.onClick} className={btnClass} aria-label={a.ariaLabel || a.label} size="sm">
              {a.icon}
              <span className="hidden sm:inline">{a.label}</span>
            </Button>
          )
        })}
        </div>
      )}

      {/* Mobile: compact menu (only render when actions exist) */}
      {actions.length > 0 && (
        <div className="sm:hidden relative flex justify-end" ref={menuRef}>
          <button
            aria-expanded={open}
            aria-label={open ? "Cerrar acciones" : "Abrir acciones"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center p-2 rounded-full bg-[#F7f9ff] border border-gray-200 "
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          {open && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                {actions.map((a, i) => (
                  <button
                    key={`${a.label}-m-${i}`}
                    onClick={() => {
                      setOpen(false)
                      a.onClick?.()
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    {a.icon}
                    <span className="text-sm text-gray-700">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HeaderControls

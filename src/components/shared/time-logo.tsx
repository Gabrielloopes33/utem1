"use client"

import { cn } from "@/lib/utils"

interface TimeLogoProps {
  size?: number
  className?: string
}

export function TimeLogo({ size = 28, className }: TimeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      {/* Background rounded square */}
      <rect width="32" height="32" rx="8" fill="#5B8DEF" />

      {/* Robot head outline */}
      <rect x="7" y="10" width="18" height="14" rx="4" fill="white" />

      {/* Antenna */}
      <line x1="16" y1="5" x2="16" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="4.5" r="1.5" fill="white" />

      {/* Left eye */}
      <rect x="10.5" y="14" width="4" height="4" rx="1.5" fill="#5B8DEF" />
      {/* Left eye shine */}
      <circle cx="11.5" cy="15" r="0.7" fill="white" />

      {/* Right eye */}
      <rect x="17.5" y="14" width="4" height="4" rx="1.5" fill="#5B8DEF" />
      {/* Right eye shine */}
      <circle cx="18.5" cy="15" r="0.7" fill="white" />

      {/* Mouth — friendly smile */}
      <path
        d="M12.5 20.5C12.5 20.5 14 22 16 22C18 22 19.5 20.5 19.5 20.5"
        stroke="#5B8DEF"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Side "ears" / connectors */}
      <rect x="4" y="14.5" width="3" height="5" rx="1.5" fill="white" opacity="0.8" />
      <rect x="25" y="14.5" width="3" height="5" rx="1.5" fill="white" opacity="0.8" />
    </svg>
  )
}

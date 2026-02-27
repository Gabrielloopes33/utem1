"use client"

import { useMemo } from "react"
import { createAvatar } from "@dicebear/core"
import { botttsNeutral } from "@dicebear/collection"
import { cn } from "@/lib/utils"

interface AgentAvatarProps {
  seed: string
  size?: number
  className?: string
  avatarUrl?: string | null
}

export function AgentAvatar({
  seed,
  size = 40,
  className,
  avatarUrl,
}: AgentAvatarProps) {
  const svg = useMemo(() => {
    if (avatarUrl) return null
    const avatar = createAvatar(botttsNeutral, {
      seed,
      size,
      radius: 12,
    })
    return avatar.toDataUri()
  }, [seed, size, avatarUrl])

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={seed}
        className={cn("rounded-xl object-cover", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <img
      src={svg!}
      alt={seed}
      className={cn("rounded-xl", className)}
      style={{ width: size, height: size }}
    />
  )
}

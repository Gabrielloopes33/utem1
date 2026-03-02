"use client"

import { useMemo } from "react"
import { createAvatar } from "@dicebear/core"
import { botttsNeutral } from "@dicebear/collection"
import Image from "next/image"
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
      <Image
        src={avatarUrl}
        alt={seed}
        width={size}
        height={size}
        unoptimized
        className={cn("rounded-xl object-cover", className)}
      />
    )
  }

  return (
    <Image
      src={svg!}
      alt={seed}
      width={size}
      height={size}
      unoptimized
      className={cn("rounded-xl", className)}
    />
  )
}

import Image from "next/image"

interface AutemLogoProps {
  className?: string
}

export function AutemLogo({ className }: AutemLogoProps) {
  return (
    <Image
      src="/logo-autem.png"
      alt="AUTEM Investimentos"
      width={140}
      height={40}
      className={className}
      priority
    />
  )
}

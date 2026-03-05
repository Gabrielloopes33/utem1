"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useLazyImage, useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  containerClassName?: string
  priority?: boolean
  unoptimized?: boolean
  objectFit?: "cover" | "contain" | "fill"
  rootMargin?: string
}

/**
 * Componente de imagem com lazy loading automático via Intersection Observer
 * Só carrega a imagem quando estiver próxima da viewport (100px por padrão)
 * 
 * @example
 * <LazyImage
 *   src="https://example.com/image.jpg"
 *   alt="Descrição"
 *   width={400}
 *   height={300}
 * />
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  priority = false,
  unoptimized = false,
  objectFit = "cover",
  rootMargin = "100px",
}: LazyImageProps) {
  const { ref, shouldLoad, isLoaded, setIsLoaded } = useLazyImage({
    rootMargin,
  })

  // Se tem priority, carrega imediatamente
  if (priority) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority
        unoptimized={unoptimized}
        style={{ objectFit }}
      />
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
      style={{ width, height }}
    >
      {/* Skeleton de loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Imagem só carrega quando visível */}
      {shouldLoad && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={setIsLoaded}
          unoptimized={unoptimized}
          style={{ objectFit }}
        />
      )}
    </div>
  )
}

/**
 * Componente para lazy loading de lista de itens
 * Renderiza apenas os itens visíveis na viewport + margem
 */
interface LazyListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  className?: string
  itemClassName?: string
  rootMargin?: string
  maxInitialRender?: number
}

export function LazyList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  itemClassName,
  rootMargin = "200px",
  maxInitialRender = 10,
}: LazyListProps<T>) {
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    rootMargin,
    triggerOnce: false,
  })
  
  const [visibleCount, setVisibleCount] = useState(maxInitialRender)
  
  useEffect(() => {
    if (isIntersecting && visibleCount < items.length) {
      // Carrega mais 10 itens quando o trigger entrar na viewport
      setVisibleCount((prev) => Math.min(prev + 10, items.length))
    }
  }, [isIntersecting, items.length, visibleCount])

  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <div key={keyExtractor(item, index)} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {/* Trigger para carregar mais */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-4" aria-hidden="true" />
      )}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseIntersectionObserverOptions {
  /** Elemento alvo para observar (ref) */
  target?: React.RefObject<Element | null>
  /** Raiz do observer (null = viewport) */
  root?: Element | null
  /** Margem ao redor da raiz */
  rootMargin?: string
  /** Threshold de visibilidade (0-1) */
  threshold?: number | number[]
  /** Se deve desconectar após primeira interseção */
  triggerOnce?: boolean
  /** Habilitar/desabilitar observer */
  enabled?: boolean
}

interface UseIntersectionObserverReturn {
  /** Se o elemento está visível */
  isIntersecting: boolean
  /** Ref para o elemento a ser observado */
  ref: React.RefObject<HTMLDivElement | null>
  /** Entry do IntersectionObserver */
  entry?: IntersectionObserverEntry
}

/**
 * Hook para Intersection Observer - detecta quando elemento entra na viewport
 * 
 * @example
 * // Lazy load de imagem
 * const { ref, isIntersecting } = useIntersectionObserver({ triggerOnce: true })
 * 
 * return (
 *   <div ref={ref}>
 *     {isIntersecting && <Image src="..." />}
 *   </div>
 * )
 * 
 * @example
 * // Infinite scroll
 * const { ref, isIntersecting } = useIntersectionObserver()
 * 
 * useEffect(() => {
 *   if (isIntersecting) loadMore()
 * }, [isIntersecting])
 */
export function useIntersectionObserver({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  triggerOnce = false,
  enabled = true,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>()
  const ref = useRef<HTMLDivElement>(null)
  const hasTriggered = useRef(false)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [firstEntry] = entries
      
      if (firstEntry) {
        setEntry(firstEntry)
        
        if (triggerOnce && hasTriggered.current) {
          return
        }
        
        setIsIntersecting(firstEntry.isIntersecting)
        
        if (firstEntry.isIntersecting && triggerOnce) {
          hasTriggered.current = true
        }
      }
    },
    [triggerOnce]
  )

  useEffect(() => {
    if (!enabled) return

    const element = ref.current
    if (!element) return

    // Verificar se o navegador suporta IntersectionObserver
    if (typeof IntersectionObserver === "undefined") {
      // Fallback: considerar visível
      setIsIntersecting(true)
      return
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [root, rootMargin, threshold, enabled, handleIntersection])

  return { isIntersecting, ref, entry }
}

/**
 * Hook para lazy loading de imagens
 * Só carrega a imagem quando estiver próxima da viewport
 */
export function useLazyImage({
  rootMargin = "100px",
}: {
  rootMargin?: string
} = {}): {
  ref: React.RefObject<HTMLDivElement | null>
  shouldLoad: boolean
  isLoaded: boolean
  setIsLoaded: () => void
} {
  const { isIntersecting, ref } = useIntersectionObserver({
    rootMargin,
    triggerOnce: true,
  })
  const [isLoaded, setIsLoadedState] = useState(false)

  const setIsLoaded = useCallback(() => {
    setIsLoadedState(true)
  }, [])

  return {
    ref,
    shouldLoad: isIntersecting,
    isLoaded,
    setIsLoaded,
  }
}

/**
 * Hook para infinite scroll
 * Carrega mais dados quando o usuário chega ao final da lista
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = "200px",
}: {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  rootMargin?: string
}): {
  ref: React.RefObject<HTMLDivElement | null>
  isIntersecting: boolean
} {
  const { isIntersecting, ref } = useIntersectionObserver({
    rootMargin,
    enabled: hasMore && !isLoading,
  })

  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      onLoadMore()
    }
  }, [isIntersecting, hasMore, isLoading, onLoadMore])

  return { ref, isIntersecting }
}

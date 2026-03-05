// src/lib/cache/memory-cache.ts
/**
 * Cache em memória simples para desenvolvimento/fallback
 * Em produção com múltiplas instâncias, usar Redis/Vercel KV
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly defaultTTL: number

  constructor(defaultTTLSeconds = 300) {
    this.defaultTTL = defaultTTLSeconds * 1000
    // Limpeza automática a cada 5 minutos
    setInterval(() => this.cleanup(), 300000)
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number
  ): Promise<void> {
    const ttl = (ttlSeconds ?? this.defaultTTL / 1000) * 1000
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Singleton instance
export const memoryCache = new MemoryCache()

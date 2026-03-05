/**
 * Utilitários para fetch com timeout e retry
 * Previne requests que ficam pendentes indefinidamente
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  /** Timeout em ms (padrão: 15000ms) */
  timeout?: number
  /** Número de retries (padrão: 0) */
  retries?: number
  /** Delay entre retries em ms (padrão: 1000ms) */
  retryDelay?: number
}

export class TimeoutError extends Error {
  constructor(message: string, public url: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class RetryExhaustedError extends Error {
  constructor(
    message: string,
    public url: string,
    public attempts: number,
    public lastError: Error
  ) {
    super(message)
    this.name = 'RetryExhaustedError'
  }
}

/**
 * Fetch com timeout automático
 * Aborta a requisição se ultrapassar o tempo limite
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 15000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(`Request timeout after ${timeout}ms`, url)
    }
    
    throw error
  }
}

/**
 * Fetch com timeout e retry automático
 * Tenta novamente em caso de erro de rede ou timeout
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, fetchOptions)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Não retry em erros 4xx (client errors)
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error
      }

      // Última tentativa falhou
      if (attempt === retries) {
        break
      }

      // Aguardar antes de tentar novamente
      await sleep(retryDelay * Math.pow(2, attempt)) // Exponential backoff
    }
  }

  throw new RetryExhaustedError(
    `Failed after ${retries + 1} attempts`,
    url,
    retries + 1,
    lastError!
  )
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wrapper para Supabase RPC com timeout
 * Útil para queries complexas que podem demorar
 */
export async function rpcWithTimeout<T>(
  rpcCall: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    rpcCall(),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(`RPC timeout after ${timeoutMs}ms`, 'supabase')),
        timeoutMs
      )
    ),
  ])
}

// Timeouts recomendados por tipo de operação
export const TIMEOUTS = {
  /** Queries rápidas (SELECT simples) */
  FAST: 5000,
  /** Queries normais (SELECT com joins) */
  NORMAL: 15000,
  /** Queries complexas (agregações, análises) */
  COMPLEX: 30000,
  /** Chamadas externas (n8n, APIs terceiras) */
  EXTERNAL: 30000,
  /** Uploads/Downloads de arquivos */
  FILE_TRANSFER: 60000,
  /** Operações de IA (streaming, embeddings) */
  AI: 120000,
} as const

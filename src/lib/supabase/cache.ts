import { cache } from "react"
import { createClient, createServiceClient, createSystemClient } from "./server"

/**
 * Singleton pattern para Supabase Client
 * Usa React cache() para garantir mesma instância por request
 * 
 * @see https://react.dev/reference/react/cache
 */

/**
 * Get cached Supabase client (public schema)
 * Mesma instância durante todo o request
 */
export const getSupabaseClient = cache(() => {
  return createClient()
})

/**
 * Get cached Supabase client (nexia schema)
 * Mesma instância durante todo o request
 */
export const getSystemClient = cache(() => {
  return createSystemClient()
})

/**
 * Get cached Supabase service client (admin privileges)
 * Mesma instância durante todo o request
 */
export const getServiceClient = cache(() => {
  return createServiceClient()
})

/**
 * Get cached Supabase client with custom schema
 * Mesma instância durante todo o request
 */
export const getClientWithSchema = cache((schema: string) => {
  return createClient(schema)
})

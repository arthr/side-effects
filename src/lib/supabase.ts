import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Verifica se o Supabase esta configurado
 */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

/**
 * Cliente Supabase (pode ser null se nao configurado)
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

/**
 * Retorna o cliente Supabase ou lanca erro se nao configurado
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase not configured. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    )
  }
  return supabase
}
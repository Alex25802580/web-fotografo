import { supabase } from './supabase'

export const PORTFOLIO_BUCKET = 'PORTFOLIO'

export function getPortfolioPublicUrl(storagePath) {
  return supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(storagePath).data.publicUrl
}

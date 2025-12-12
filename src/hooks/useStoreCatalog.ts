import * as storeConfig from '@/utils/storeConfig'

/**
 * Hook "data-only" para expor configuração/catálogo da Pill Store à UI
 */
export function useStoreCatalog() {
  return storeConfig
}



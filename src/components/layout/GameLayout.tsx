import type { ReactNode } from 'react'

interface GameLayoutProps {
  children: ReactNode
}

/**
 * Layout principal do jogo Side Effects
 * Estrutura: Header + Area de Jogadores + Mesa de Pilulas
 */
export function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Side Effects
          </h1>
          <span className="text-sm text-muted-foreground">Pill Roulette</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        Gestao de Risco & Informacao Oculta
      </footer>
    </div>
  )
}

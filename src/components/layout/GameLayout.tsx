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

/**
 * Layout para area de jogo ativo
 * Grid responsivo: Jogadores nas laterais, mesa no centro
 */
interface GameAreaLayoutProps {
  playerArea: ReactNode
  opponentArea: ReactNode
  tableArea: ReactNode
  statusArea?: ReactNode
}

export function GameAreaLayout({
  playerArea,
  opponentArea,
  tableArea,
  statusArea,
}: GameAreaLayoutProps) {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Status/Turn Indicator */}
      {statusArea && (
        <div className="flex justify-center">{statusArea}</div>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 flex-1 items-start">
        {/* Player 1 (Left/Top on mobile) */}
        <div className="order-2 lg:order-1">{playerArea}</div>

        {/* Table/Pool (Center) */}
        <div className="order-1 lg:order-2">{tableArea}</div>

        {/* Player 2 / Opponent (Right/Bottom on mobile) */}
        <div className="order-3">{opponentArea}</div>
      </div>
    </div>
  )
}

/**
 * Container para cards de area do jogador
 */
interface PlayerContainerProps {
  children: ReactNode
  isCurrentTurn?: boolean
  position?: 'left' | 'right'
}

export function PlayerContainer({
  children,
  isCurrentTurn = false,
  position = 'left',
}: PlayerContainerProps) {
  return (
    <div
      className={`
        rounded-xl border-2 p-4 transition-all duration-300
        ${isCurrentTurn 
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
          : 'border-border bg-card/50'
        }
        ${position === 'right' ? 'lg:text-right' : ''}
      `}
    >
      {children}
    </div>
  )
}

/**
 * Container para a mesa de pilulas
 */
interface TableContainerProps {
  children: ReactNode
}

export function TableContainer({ children }: TableContainerProps) {
  return (
    <div className="rounded-xl border border-border bg-card/30 p-6 min-h-[300px]">
      {children}
    </div>
  )
}


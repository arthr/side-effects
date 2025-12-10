import type { ConnectionStatus as ConnectionStatusType } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  /** Status atual da conexao */
  status: ConnectionStatusType
  /** Exibir label ao lado do indicador */
  showLabel?: boolean
  /** Classes CSS adicionais */
  className?: string
}

/** Configuracao visual para cada status */
const STATUS_CONFIG: Record<
  ConnectionStatusType,
  { color: string; label: string; description: string }
> = {
  connected: {
    color: 'bg-green-500',
    label: 'Conectado',
    description: 'Conexao estavel com o servidor',
  },
  connecting: {
    color: 'bg-amber-500 animate-pulse',
    label: 'Conectando',
    description: 'Estabelecendo conexao...',
  },
  reconnecting: {
    color: 'bg-amber-500 animate-pulse',
    label: 'Reconectando',
    description: 'Tentando reconectar ao servidor...',
  },
  disconnected: {
    color: 'bg-red-500',
    label: 'Desconectado',
    description: 'Sem conexao com o servidor',
  },
  error: {
    color: 'bg-red-500',
    label: 'Erro',
    description: 'Erro na conexao com o servidor',
  },
  not_configured: {
    color: 'bg-gray-500',
    label: 'Nao configurado',
    description: 'Multiplayer nao configurado',
  },
}

/**
 * Indicador visual de status de conexao multiplayer
 * Exibe bolinha colorida com tooltip detalhado
 */
export function ConnectionStatus({
  status,
  showLabel = false,
  className,
}: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-2 cursor-default',
              className
            )}
          >
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full shrink-0',
                config.color
              )}
              aria-label={config.label}
            />
            {showLabel && (
              <span className="text-sm text-muted-foreground">
                {config.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-center">
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


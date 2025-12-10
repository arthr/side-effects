import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/8bit/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/8bit/tooltip'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { DifficultyLevel } from '@/types'
import { DIFFICULTY_LABELS, DIFFICULTY_DESCRIPTIONS } from '@/types'

interface DifficultySelectProps {
  value: DifficultyLevel
  onChange: (value: DifficultyLevel) => void
}

const DIFFICULTIES: DifficultyLevel[] = ['easy', 'normal', 'hard', 'insane']

/**
 * Componente de selecao de dificuldade da IA
 * Exibe as 4 opcoes com tooltips descritivos
 */
export function DifficultySelect({ value, onChange }: DifficultySelectProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm text-muted-foreground retro">Dificuldade</label>
        <Select value={value} onValueChange={(v) => onChange(v as DifficultyLevel)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTIES.map((diff) => (
              <Tooltip key={diff}>
                <TooltipTrigger asChild>
                  <SelectItem value={diff}>{DIFFICULTY_LABELS[diff]}</SelectItem>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[200px]">
                  <p className="text-xs">{DIFFICULTY_DESCRIPTIONS[diff]}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </SelectContent>
        </Select>
      </div>
    </TooltipProvider>
  )
}


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/8bit/card'
import { Badge } from '@/components/ui/8bit/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/8bit/tooltip'
import { LivesDisplay } from './LivesDisplay'
import { ResistanceDisplay } from './ResistanceDisplay'

/**
 * Painel informativo com demonstracao dos elementos do jogo
 * Sera usado como base para tutorial/onboarding no futuro
 */
export function InfoPanel() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl text-foreground mb-2">
          Como Jogar
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg">
          Um jogo de estratégia por turnos onde dois jogadores competem
          para ser o último sobrevivente através da gestão de risco.
        </p>
      </div>

      {/* Player Stats Example */}
      <Card className="w-full max-w-sm py-2 gap-2">
        <CardHeader className="text-center border-b pb-0!">
          <CardTitle className="text-base font-normal">Seus Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Lives - usando componente reutilizavel */}
            <LivesDisplay showLabel={false} lives={2} maxLives={3} />
            <span className="text-xs text-muted-foreground">
              Perder todas = Derrota
            </span>

            {/* Resistance Bar - usando componente reutilizavel */}
            <ResistanceDisplay showLabel={false} resistance={4} maxResistance={6} />
            <span className="text-xs text-muted-foreground">
              Perder todas = -1 Vida
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Pill Types Legend */}
      <Card className="w-full max-w-sm py-2 gap-2">
        <CardHeader className="text-center border-b pb-0!">
          <CardTitle className="text-base font-normal">Tipos de Pílulas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-pill-safe hover:bg-pill-safe/80 cursor-help">
                  SAFE
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Placebo - Neutro</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-pill-dmg-low hover:bg-pill-dmg-low/80 cursor-help">
                  VENENO
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Dano baixo: -1 ou -2</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-pill-dmg-high hover:bg-pill-dmg-high/80 cursor-help">
                  TOXINA
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Dano alto: -3 ou -4</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-pill-fatal hover:bg-pill-fatal/80 cursor-help">
                  FATAL
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Zera resistência instantaneamente!</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-pill-heal hover:bg-pill-heal/80 cursor-help">
                  CURA
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Antidoto: +2 de resistência</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="bg-pill-hidden cursor-help">
                  ???
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Pílula oculta - tipo desconhecido</TooltipContent>
            </Tooltip>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Você vê a contagem total de cada tipo, mas não sabe qual é qual!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

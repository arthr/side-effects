import { useState } from 'react'
import { LogOut, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/8bit/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/8bit/card'
import { useMultiplayer } from '@/hooks'

interface ForfeitDialogProps {
  /** Se o dialog esta aberto */
  open: boolean
  /** Callback para fechar o dialog */
  onClose: () => void
}

/**
 * Dialog de confirmacao para sair da partida voluntariamente
 * Avisa que isso concedera vitoria ao oponente
 */
export function ForfeitDialog({ open, onClose }: ForfeitDialogProps) {
  const { leaveRoom } = useMultiplayer()
  const [isLeaving, setIsLeaving] = useState(false)

  const handleForfeit = async () => {
    setIsLeaving(true)
    try {
      await leaveRoom()
      // Nao precisa chamar onClose pois o estado vai resetar
    } catch {
      setIsLeaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Card className="w-full max-w-sm mx-4">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-3">
                  <AlertTriangle className="size-12 text-amber-500" />
                </div>
                <CardTitle className="text-xl">Sair da Partida?</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  Isso concedera vitoria ao seu oponente.
                  <br />
                  Tem certeza que deseja sair?
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleForfeit}
                    disabled={isLeaving}
                    className="w-full"
                  >
                    <LogOut className="size-4 mr-2" />
                    {isLeaving ? 'Saindo...' : 'Sair da Partida'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLeaving}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


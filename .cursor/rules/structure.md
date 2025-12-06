# Estrutura do Projeto e Convenções de Nomenclatura

## Estrutura de Pastas
*   `src/`: Código fonte principal.
*   `src/components/`: Componentes React (UI, tabuleiro, inventário, modais).
*   `src/game/`: Toda a lógica de negócios do jogo (classes/funções para jogadores, pílulas, turnos).
*   `src/assets/`: Imagens, sons, ícones.
*   `src/utils/`: Funções utilitárias compartilhadas.
*   `src/styles/`: Configurações globais do Tailwind CSS.

## Convenções de Nomenclatura
*   **Arquivos:** `PascalCase` para componentes React (`GameBoard.tsx`), `camelCase` para utilitários (`calculateDamage.ts`).
*   **Variáveis:** `camelCase` sempre.
*   **Componentes:** Sempre sufixados com `.tsx`.
*   **Testes:** Arquivos de teste devem ser `[Nome do Arquivo].test.ts(x)`.

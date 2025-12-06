# Pilha de Tecnologia

*   **Framework de UI:** React (com hooks funcionais)
*   **Build Tool:** Vite
*   **Linguagem:** TypeScript (modo `strict: true` ativado no `tsconfig.json`)
*   **Gerenciamento de Estado:** Use `useState`, `useReducer` ou `zustand` para o estado do jogo. Evite Redux pesado, pois React é eficiente para jogos com UI baseada em estado.
*   **Gerenciamento de Pacotes:** Use `pnpm` para fazer o gerenciamento ao invés do `npm`.
*   **Estilo e Componentes:** Use **Tailwind CSS** para estilos e **shadcn/ui** para componentes acessíveis e reutilizáveis.
*   **Lógica do Jogo:** Mantenha a lógica principal (cálculo de efeitos de pílulas, RNG, turnos) em funções puras ou em um módulo de serviço separado (`src/game/`).
*   **Estrutura:** Siga a estrutura padrão do Vite/React, com pastas para `components`, `assets`, `utils`, `game`.

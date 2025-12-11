# Refatorar Codigo

## Descricao
Planeja e executa a refatoracao de componentes ou modulos existentes, visando melhoria de performance, legibilidade ou adequacao a novos padroes arquiteturais, sem alterar o comportamento funcional (quando possivel).

## Instrucoes

### 1. Analise de Contexto (Obrigatorio)
Antes de propor mudancas, leia:
- `@.cursor/rules/architecture.md` - Para garantir alinhamento estrutural
- `@.cursor/rules/coding-style.md` - Para garantir consistencia de estilo
- `@.cursor/rules/tech-stack.md`   - Para garantir uso correto de tecnologia
- O arquivo ou modulo alvo da refatoracao

### 2. Diagnostico
Analise o codigo alvo e identifique:
- Code Smells (duplicacao, complexidade ciclomatica, funcoes gigantes)
- Violacoes dos principios SOLID
- Acoplamento indevido (ex: UI acessando logica de jogo diretamente)
- Estado mutavel nao gerenciado (Zustand/Context issues)

### 3. Plano de Refatoracao (Strategy)
Crie um arquivo temporario `.specs/refactor-[nome]/plan.md` contendo:
- **Objetivo:** O que queremos melhorar?
- **Escopo:** Quais arquivos serao tocados?
- **Estrategia:**
  - [ ] Passo 1: Isolamento (Extrair interfaces/types)
  - [ ] Passo 2: Desacoplamento (Mover logica)
  - [ ] Passo 3: Limpeza (Remover codigo morto)
- **Risco:** O que pode quebrar? (Ex: Animacoes, Sockets, Estado global)

### 4. Validacao Arquitetural
Verifique se a refatoracao exige uma ADR (Architecture Decision Record).
- Se mudar a forma como o jogo gerencia estado ou comunicacao: SUGIRA criar uma ADR.
- Se for apenas limpeza: Prossiga.

### 5. Solicitar Aprovacao
Apresente o plano e **AGUARDE APROVACAO** do usuario.
> "Analise concluida. O plano de refatoracao esta em `.specs/refactor-[nome]/plan.md`. Podemos prosseguir?"

### 6. Execucao Segura
Apos aprovacao:
- Refatore **um arquivo por vez**.
- Mantenha as assinaturas das funcoes publicas compativeis se possivel.
- Se criar novos arquivos, atualize os `imports` em todo o projeto.

### 7. Verificacao de Regressao
Apos cada etapa critica:
- Execute linter.
- Verifique se a tipagem do TypeScript esta estrita (sem `any`).
- Pergunte ao usuario se ele deseja testar funcionalidade especifica no browser.

### 8. Atualizacao de Documentacao
Se a estrutura mudou:
- Atualize `@.cursor/rules/architecture.md`
- Atualize diagramas Mermaid se existirem
- Delete o arquivo de plano temporario apos conclusao.

### 9. Finalizacao
Pergunte:
> "Refatoracao concluida e documentacao atualizada. Deseja revisar o diff?"
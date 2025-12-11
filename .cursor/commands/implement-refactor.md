# Implementar Refatoracao

## Descricao
Executa, passo a passo, o plano de refatoracao definido previamente em `.specs/refactor-[nome]/plan.md`, garantindo que nenhuma funcionalidade existente seja quebrada (regressao) durante o processo.

## Instrucoes

### 1. Contexto Obrigatorio
Antes de tocar em qualquer arquivo, leia:
- O arquivo de plano: `.specs/refactor-[nome]/plan.md`
- ADRs: `.specs/refactor-[name]/ADR-*.mb`
- As regras globais: `@.cursor/rules/architecture.md`
- `@.cursor/rules/coding-style.md` - Para garantir consistencia de estilo
- `@.cursor/rules/tech-stack.md`   - Para garantir uso correto de tecnologia
- O codigo atual que sera modificado (para entender o estado inicial).

### 2. Selecao de Etapa (Step-by-Step)
Localize no arquivo `plan.md` a proxima etapa marcada como pendente `[ ]`.
- **Nao tente executar todo o plano de uma vez.**
- Foque exclusivamente na tarefa atual.

### 3. Analise de Impacto Imediato
Antes de codar, verifique:
- Quais arquivos importam o modulo que voce vai alterar?
- Existem `types` ou `interfaces` compartilhadas que precisarao ser atualizadas?
- A alteracao vai quebrar a build momentaneamente? Se sim, avise.

### 4. Proposta de Alteracao
Explique ao usuario:
1. O que sera movido/renomeado/alterado.
2. Como voce garantira que a logica se mantem a mesma (ex: "Manterei a mesma assinatura da funcao `processTurn`").
3. **Solicite Aprovacao:** "Posso aplicar esta etapa?"

### 5. Execucao Cirurgica
Apos aprovacao:
- Execute a refatoracao.
- **Regra de Ouro:** Se voce encontrar um bug pre-existente durante a refatoracao, NAO O CORRIJA AGORA. Apenas adicione um comentario `// TODO: Bug encontrado...` e siga a refatoracao. Misturar refatoracao com correcao de bug e perigoso.
- Use `ts-prune` ou analise estatica para garantir que nao sobraram imports inuteis.

### 6. Verificacao de Integridade
Apos a alteracao:
- Execute o linter.
- Verifique se o TypeScript compila sem erros.
- Se a refatoracao envolveu UI, pergunte: "O layout visual precisa ser verificado?"

### 7. Atualizar Progresso
- Marque a tarefa como concluida `[x]` no arquivo `plan.md`.
- Se a refatoracao mudou a forma de usar um componente/funcao, atualize referencias no codigo.

### 8. Loop
Pergunte:
> "Etapa concluida e validada. Podemos prosseguir para a proxima etapa do plano?"

### 9. Limpeza Final (Quando `plan.md` estiver 100% concluido)
- Pergunte ao usuario se o arquivo `.specs/refactor-[nome]/plan.md` pode ser deletado.
- Sugira um commit com a mensagem: `refactor: [nome da refatoracao] complete`
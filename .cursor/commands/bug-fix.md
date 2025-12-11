# Corrigir Bug

## Descricao
Diagnostica e corrige erros relatados, priorizando a identificacao da causa raiz (Root Cause Analysis) em vez de correcoes paliativas, garantindo a integridade do fluxo do jogo.

## Instrucoes

### 1. Coleta de Evidencias
Antes de alterar codigo:
- Leia `@docs/FLUXO.md` e `@.cursor/rules/product.md` para entender o comportamento ESPERADO.
- Solicite ao usuario o stack trace, logs do console ou passos para reproducao.
- Localize o trecho de codigo suspeito.

### 2. Analise de Causa Raiz (RCA)
Nao proponha correcoes imediatas. Analise:
- O erro e de logica, de estado (race condition) ou de visualizacao?
- O erro ocorre devido a uma resposta inesperada do Backend/Socket?
- O erro e uma regressao de uma feature recente?

### 3. Proposta de Solucao
Escreva no chat um breve plano:
1. **Causa:** Explicacao tecnica do erro.
2. **Solucao Proposta:** O que sera alterado.
3. **Arquivos Afetados:** Lista de arquivos.
4. **Side Effects:** Risco de quebrar outra mecânica (ex: corrigir o timer quebrar a animacao de turno).

### 4. Solicitar Aprovacao
**AGUARDE APROVACAO** antes de aplicar a correcao.

### 5. Execucao da Correcao
Apos aprovacao:
- Aplique a correcao de forma cirurgica.
- Adicione comentarios explicativos se a logica for complexa ou contraintuitiva (ex: workarounds de browser).
- Se o bug revelou uma falha na tipagem, reforce os Types/Interfaces.

### 6. Teste de Verificacao
- Instrua o usuario sobre como validar se o bug foi corrigido.
- Se possivel, crie um teste unitario ou de integracao para evitar reincidencia.

### 7. Atualizacao de Conhecimento
Se o bug foi causado por entendimento errado da arquitetura:
- Atualize `@.cursor/rules/architecture.md` ou `@docs/FLUXO.md` com uma nota de alerta ("Gotcha").
- Exemplo: "Nota: O estado do WebSocket nao deve ser lido diretamente no render, use o hook useSocketStore".

### 8. Finalizacao
Confirme:
> "Bug corrigido e documentacao de borda atualizada. Podemos fechar a issue?"
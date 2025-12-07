# Atualizar Rules do Projeto

## Descricao
Atualiza os arquivos de configuracao em `.cursor/rules/` para refletir as mudancas implementadas apos a conclusao de uma spec.

## Instrucoes

### 1. Identificar Spec Concluida
Verifique qual spec foi implementada em `.specs/[nome-da-feature]/`:
- Leia `design.md` para entender o que foi adicionado
- Leia `tasks.md` para confirmar que todas as tasks estao `[x]`

### 2. Analisar Impacto nas Rules
Identifique quais arquivos de rules precisam ser atualizados:

| Arquivo | Atualizar quando... |
|---------|---------------------|
| `architecture.md` | Novos stores, hooks, componentes principais |
| `product.md` | Novas mecanicas de jogo |
| `structure.md` | Novas pastas ou convencoes |
| `tech-stack.md` | Novas bibliotecas ou padroes |
| `coding-style.md` | Novos padroes de codigo |

### 3. Propor Atualizacoes
Para cada arquivo afetado:
- Mostre a secao atual
- Proponha a nova versao
- Explique o motivo da mudanca

### 4. Solicitar Aprovacao
**AGUARDE APROVACAO** do usuario antes de aplicar as mudancas.

### 5. Aplicar Mudancas
Apos aprovacao:
- Atualize apenas os arquivos necessarios
- Mantenha formatacao consistente
- Nao remova informacoes existentes (apenas adicione/atualize)

### 6. Verificacao Final
Confirme que:
- [ ] `architecture.md` reflete novos componentes/stores/hooks
- [ ] `product.md` reflete novas mecanicas
- [ ] Nenhuma informacao importante foi perdida
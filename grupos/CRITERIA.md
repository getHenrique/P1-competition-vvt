# Critérios de Avaliação: Competição VVT (LibraryService)

> Contém o gabarito dos testes plantados e a especificação dos 3 critérios de pontuação.

---

## Visão geral

- Avaliação **relativa** entre os grupos.
- 3 critérios. Cada critério premia os top 3 com **3 / 2 / 1** pontos.
- Total máximo: **9 pts**.
- Desempate global: **C3, depois C1, depois C2**.
- **Estado inicial:** ao rodar `tests/library.test.ts` contra a lib correta, 8 passam e 3 falham (P-7, P-10, P-11).

---

## C1: Funcionalidades cobertas + casos de borda

### Pontuação

- **+1 bruto** por cada F#/B# coberto por pelo menos UM teste do grupo com **asserção real sobre o comportamento**: pode ser sobre o **valor retornado** (`toEqual`/`toBe`), **interações com o repository** (`expect(repo.saveX).toHaveBeenCalledWith(...)`) ou **erro lançado** (`toThrow('MEMBER_NOT_FOUND')`). Não conta `toBeDefined`/`typeof`/`not.toThrow` solto.
- Total bruto máximo: **18** (4 funcionalidades + 14 casos de borda).
- Top 3 brutos ganham **3 / 2 / 1** pts.
- Métricas do vitest (`% Stmts`/`% Branch`/`% Funcs`/`% Lines`) **não** são alvo de nota, servem como feedback automático para o aluno e como **desempate interno** do C1.

### Funcionalidades: caminhos felizes


| ID  | Cenário                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------- |
| F1  | `borrowBook` bem-sucedido: cria `Loan` com `borrowedAt`/`dueAt` corretos e muda `book.status` para `'borrowed'`. |
| F2  | `returnBook` no prazo: `daysLate=0`, `feeInCents=0`, marca `returnedAt`, libera o livro.                         |
| F3  | `returnBook` com atraso: calcula `daysLate` e `feeInCents` corretos (com escalonamento).                         |
| F4  | `getMemberStatus` retornando snapshot consistente para um membro com loans.                                      |


### Casos de borda


| ID  | Cenário                                                                       |
| --- | ----------------------------------------------------------------------------- |
| B1  | `borrowBook` retorna `MEMBER_NOT_FOUND`.                                            |
| B2  | `borrowBook` retorna `BOOK_NOT_FOUND`.                                              |
| B3  | `borrowBook` retorna `BOOK_NOT_AVAILABLE` quando `book.status === 'borrowed'`.      |
| B4  | `borrowBook` retorna `BOOK_NOT_AVAILABLE` quando `book.status === 'maintenance'`.   |
| B5  | `borrowBook` retorna `LIMIT_REACHED` para student no 4º empréstimo (limite=3).      |
| B6  | `borrowBook` retorna `LIMIT_REACHED` para professor no 6º empréstimo (limite=5).    |
| B7  | `borrowBook` retorna `HAS_OVERDUE` quando o member tem loan vencido.                |
| B8  | `returnBook` retorna `LOAN_NOT_FOUND` quando ninguém tem o livro emprestado.        |
| B9  | `returnBook` retorna `NOT_BORROWER` quando outro member é o tomador.                |
| B10 | `getMemberStatus` lança `LibraryError` com `code='MEMBER_NOT_FOUND'`.         |
| B11 | Multa exatamente 0 quando `today === dueAt`.                                  |
| B12 | Transição de faixa da multa: 3 dias = 600, 4 dias = 1100.                     |
| B13 | `canBorrow=false` quando há atraso, mesmo com `remainingSlots > 0`.           |
| B14 | Prazo correto: student `dueAt = today + 7d`, professor `dueAt = today + 14d`. |


---

## C2: AAA & Qualidade

### Pontuação

5 itens, cada um pontua **0 / 1 / 2** (máx 10 brutos). Top 3 brutos ganham **3 / 2 / 1** pts.

### Itens


| #   | Item                                                       |
| --- | ---------------------------------------------------------- |
| a   | AAA visualmente separado nos testes adicionados/corrigidos |
| b   | Naming descritivo (cenário + comportamento esperado)       |
| c   | Single concern por teste                                   |
| d   | Sem lógica condicional dentro do teste                     |
| e   | `describe` aninhado por método/contexto + uso de fixtures  |


---

## C3: Problemas resolvidos

### Pontuação

- **+1** por cada P-4..P-11 corrigido conforme a coluna "Correção esperada" da tabela abaixo (máx +8).
- **−1** por cada P-1/P-2/P-3 alterado de forma que destrua o que ele já verificava bem (falso positivo).
- **Saldo** = corrigidos − falsos positivos.
- Top 3 saldos ganham **3 / 2 / 1** pts.

### Catálogo dos testes plantados em `tests/library.test.ts`


| ID   | Descrição                                        | Estado contra lib correta | Tipo                                       | Correção esperada                                                                           |
| ---- | ------------------------------------------------ | ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| P-1  | `permite student emprestar livro disponível`     | ✅ passa                   | Correto e útil                             | Manter (mexer = falso positivo)                                                             |
| P-2  | `calcula multa de 2 dias atrasado`               | ✅ passa                   | Correto e útil                             | Manter                                                                                      |
| P-3  | `bloqueia empréstimo quando livro está borrowed` | ✅ passa                   | Correto e útil                             | Manter                                                                                      |
| P-4  | `retorna algo ao emprestar`                      | ✅ passa                   | ❌ incorreto (`toBeDefined`)                | Remover ou substituir por assertion de valor                                                |
| P-5  | `getMemberStatus retorna um objeto`              | ✅ passa                   | ❌ incorreto (`typeof object`)              | Remover ou substituir                                                                       |
| P-6  | `canBorrow é booleano`                           | ✅ passa                   | ❌ incorreto (`typeof boolean`)             | Remover ou substituir por teste do **valor**                                                |
| P-7  | `professor pode emprestar até 3 livros`          | ❌ falha                   | 🐛 Setup + asserção errados                | Reescrever para "professor empresta **5** com sucesso, falha no **6º** com `LIMIT_REACHED`" |
| P-8  | `returnBook calcula multa` (mock)                | ✅ passa (do mock)         | 🐛 Mock indevido: testa o próprio mock     | Remover; testar `returnBook` real                                                           |
| P-9  | `borrowBook não lança erro com inputs válidos`   | ✅ passa                   | ❌ incorreto (`not.toThrow` solto)          | Substituir por teste com assertion sobre o retorno                                          |
| P-10 | `calcula multa de 5 dias atrasado` (espera `1000`) | ❌ falha                   | 🐛 Asserção errada (esquece escalonamento) | Corrigir para `feeInCents === 1600`                                                         |
| P-11 | `getMemberStatus para membro inexistente`        | ❌ falha                   | 🐛 Espera não-lançar; regra é lançar       | `expect(...).toThrow('MEMBER_NOT_FOUND')`                                                   |


---

## Desempate global

1. C3 (problemas)
2. C1 (cobertura, desempate interno: branch coverage %)
3. C2 (qualidade)


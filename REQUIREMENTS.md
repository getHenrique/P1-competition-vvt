# LibraryService — Requisitos

## 1. Contexto

A biblioteca da Universidade está migrando seu controle de empréstimos do papel para um sistema digital. Você foi contratado para entregar o **núcleo de regras de negócio** — uma classe de domínio (`LibraryService`) que outras camadas (CLI, web, mobile) vão consumir.

Esse módulo é deliberadamente **pequeno e isolado**:

- Recebe um `LibraryRepository` (porta) pelo construtor — toda a persistência (membros, livros, loans) é responsabilidade dele. O serviço **não** acessa banco, arquivo ou rede direto: só conhece a **interface**.
- Expõe **três operações** que cobrem o fluxo principal do balcão de atendimento:
  - emprestar um livro,
  - devolver um livro,
  - consultar o status de um membro.

A precisão dessas três operações é crítica: erros viram multas indevidas, atritos no balcão e dor de cabeça administrativa.

## 2. Personas e fluxo

| Persona       | Papel                            | Quando aciona o sistema                                  |
|---------------|----------------------------------|----------------------------------------------------------|
| **Estudante** | Member do tipo `student`         | Quer pegar/devolver livros para estudo (curto prazo).    |
| **Professor** | Member do tipo `professor`       | Quer pegar/devolver livros para pesquisa (longo prazo).  |
| **Atendente** | Quem opera o sistema no balcão   | Chama os métodos, lê o resultado, atende o membro.       |

```
[Membro chega ao balcão]
        │
        ├── quer pegar um livro     → borrowBook(memberId, bookId, today)
        ├── quer devolver um livro  → returnBook(memberId, bookId, today)
        └── quer consultar situação → getMemberStatus(memberId, today)
```

> Não há autenticação no domínio. Quem chama o método é confiável (o atendente). A camada de cima é responsável por autorizar.

## 3. Decisões de design

Algumas escolhas que valem entender **antes** de ler as regras — elas explicam o porquê das R# adiante.

### 3.1 Tempo é injetado, não consultado
O serviço **não consulta o relógio**. Toda operação recebe `today: Date` como parâmetro. Isso elimina dependência de `Date.now()` e torna os testes determinísticos sem mocks de tempo.

### 3.2 Falhas previsíveis são valores; falhas de programação são exceções
- `borrowBook` e `returnBook` retornam `{ success, reason? }`. Falhas operacionais (livro não disponível, membro no limite) são parte do contrato.
- `getMemberStatus` **lança** quando o membro não existe. Consultar status de ID inexistente indica bug do consumidor, não cenário de negócio.

### 3.3 Dinheiro em centavos
Multas são `number` inteiro em **centavos**, para evitar arredondamento de ponto flutuante. A formatação fica com a UI.

### 3.4 Validações em ordem fixa
A validação de `borrowBook` para no primeiro problema encontrado, em ordem determinística. Isso garante que o atendente sempre vê a mensagem mais fundamental primeiro (o que não existe → o que está bloqueado → quem é o tomador).

### 3.5 Histórico não desaparece
Loans devolvidos **não são apagados** — apenas ganham `returnedAt`. O repositório pode armazenar milhares de loans antigos, e isso é normal.

### 3.6 Persistência via porta (`LibraryRepository`)
Todo acesso a dados (membros, livros, loans) passa por uma **interface** injetada no construtor. Isso significa:

- **Para os testes:** mocar a porta com `mock<LibraryRepository>()` (do `vitest-mock-extended`) é o padrão. Você controla o que cada `findX`/`saveX` faz por cenário.
- **Para a produção:** uma implementação real (banco, arquivo, memória) implementa a mesma interface — o serviço não muda.

A interface está em [`src/lib/ports.ts`](src/lib/ports.ts).

## 4. Regras de negócio

> Os tipos (`Member`, `Book`, `Loan`, `BorrowResult`, `ReturnResult`, `MemberStatus`) ficam em [src/lib/domain.ts](src/lib/domain.ts), erros em [src/lib/errors.ts](src/lib/errors.ts), a porta `LibraryRepository` em [src/lib/ports.ts](src/lib/ports.ts) e o serviço em [src/lib/library.ts](src/lib/library.ts) — consulte para o contrato exato.

### R1. Limites e prazos por tipo
| Tipo        | Limite simultâneo | Prazo padrão |
|-------------|:-----------------:|:------------:|
| `student`   | 3 livros          | 7 dias       |
| `professor` | 5 livros          | 14 dias      |

### R2. Elegibilidade do livro
Apenas livros com `status === 'available'` podem ser emprestados. `'borrowed'` e `'maintenance'` são ambos bloqueados com o mesmo motivo (`BOOK_NOT_AVAILABLE`) — para o atendente, a resposta operacional é a mesma.

### R3. `borrowBook` — ordem de validação
A primeira condição a falhar curto-circuita as demais:

1. `memberId` existe? Se não → `MEMBER_NOT_FOUND`.
2. `bookId` existe? Se não → `BOOK_NOT_FOUND`.
3. `book.status === 'available'`? Se não → `BOOK_NOT_AVAILABLE`.
4. Membro tem algum loan ativo com `today > dueAt`? Se sim → `HAS_OVERDUE`.
5. `activeLoans >= limite`? Se sim → `LIMIT_REACHED`.

Passou nas cinco:
- cria `Loan` com `borrowedAt = today`, `dueAt = today + diasPermitidos`, `returnedAt = null`;
- muda `book.status` para `'borrowed'`;
- retorna `{ success: true, loan }`.

### R4. `returnBook` — fluxo
- Procura `Loan` ativo (`returnedAt === null`) com o par `memberId + bookId`.
- **Não achou** → distinguir dois casos:
  - Existe loan ativo para `bookId` mas com outro membro → `reason: 'NOT_BORROWER'`.
  - Não existe loan ativo nenhum para `bookId` → `reason: 'LOAN_NOT_FOUND'`.
  - Em ambos: `{ success: false, feeInCents: 0, daysLate: 0, reason }`.
- **Achou**:
  - marca `loan.returnedAt = today`;
  - muda `book.status` para `'available'`;
  - calcula `daysLate` (R5) e `feeInCents` (R6);
  - retorna `{ success: true, daysLate, feeInCents }`.

### R5. Dias de atraso
- Se `today <= dueAt` → `daysLate = 0`.
- Senão: `daysLate = ceil((today − dueAt) em dias)`.

> O `ceil` garante que devolução com fração de dia conta como dia inteiro (12h depois do prazo = 1 dia de atraso).

### R6. Multa escalonada
| Faixa de atraso     | Tarifa diária    |
|---------------------|------------------|
| 0 dias              | 0 centavos       |
| 1º ao 3º dia        | 200 centavos/dia |
| 4º dia em diante    | 500 centavos/dia |

A multa é a soma das faixas atravessadas.

| Dias atraso | Cálculo                  | Total  |
|:-----------:|--------------------------|-------:|
| 1           | 1 × 200                  |   200  |
| 2           | 2 × 200                  |   400  |
| 3           | 3 × 200                  |   600  |
| 4           | 3 × 200 + 1 × 500        |  1100  |
| 5           | 3 × 200 + 2 × 500        |  1600  |
| 10          | 3 × 200 + 7 × 500        |  4100  |

### R7. Status do membro
- `activeLoans` = empréstimos do membro com `returnedAt === null`.
- `overdueLoans` = dos ativos, quantos têm `today > dueAt`.
- `remainingSlots` = `max(0, limite − activeLoans)`.
- `canBorrow` = `remainingSlots > 0 && overdueLoans === 0`.

> `canBorrow` é a forma resumida da elegibilidade. Não substitui R3 (a validação real só acontece em `borrowBook`), mas serve para a UI desabilitar o botão.

### R8. Erros e exceções
| Operação            | Comportamento quando o ID não existe                |
|---------------------|------------------------------------------------------|
| `borrowBook`        | retorna `{ success: false, reason: ... }`            |
| `returnBook`        | retorna `{ success: false, reason: ... }`            |
| `getMemberStatus`   | **lança** `LibraryError` com `code: 'MEMBER_NOT_FOUND'` (a `message` defaulta para o `code`, então `expect(...).toThrow('MEMBER_NOT_FOUND')` casa) |

Em `returnBook`, distinguir os dois cenários de "não achou":
- `LOAN_NOT_FOUND` — ninguém tem aquele livro emprestado agora.
- `NOT_BORROWER` — alguém tem, mas não é o `memberId` informado.

## 5. Casos de uso ilustrativos

### UC-1. Estudante pega um livro disponível
**Estado:** Alice (`student`) sem empréstimos. Livro "Clean Code" `available`.
**Ação:** `borrowBook('alice', 'cleancode', 2025-06-10)`
**Resultado:**
- `success = true`
- `loan.dueAt = 2025-06-17` (7 dias)
- `book.status = 'borrowed'`

### UC-2. Devolução com 5 dias de atraso
**Estado:** Carol (`student`) pegou "mythicalman" em 2025-06-01. `dueAt = 2025-06-08`.
**Ação:** `returnBook('carol', 'mythicalman', 2025-06-13)`
**Resultado:**
- `success = true`
- `daysLate = 5`
- `feeInCents = 1600` (3 × 200 + 2 × 500)

### UC-3. Consulta a membro inexistente
**Ação:** `getMemberStatus('fantasma', hoje)`
**Resultado:** lança `LibraryError` com `code='MEMBER_NOT_FOUND'`.

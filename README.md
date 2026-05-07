# Competição VVT — LibraryService

Competição prática de **testes unitários com Vitest**. Você recebe uma aplicação pronta (`src/lib/library.ts`) e um arquivo de testes inicial (`tests/library.test.ts`). Sua missão em ~1h: deixar o arquivo de testes **honesto, abrangente e bem estruturado**.

> 📋 Os requisitos completos da aplicação (contexto, modelo de domínio, API e regras de negócio R1–R8) estão em [REQUIREMENTS.md](REQUIREMENTS.md). **Leia primeiro.**

---

## Como começar

1. Instale as dependências:
  ```powershell
   npm install
  ```
2. Crie a sua pasta dentro de [grupos/](grupos/) (use o nome do grupo ou seu nome):
  ```powershell
   mkdir grupos\NOME-DO-GRUPO
  ```
3. Copie o arquivo inicial de testes para a sua pasta:
  ```powershell
   copy tests\library.test.ts grupos\NOME-DO-GRUPO\library.test.ts
  ```
4. Edite **apenas** o arquivo dentro de `grupos/NOME-DO-GRUPO/`. Não edite `src/lib/library.ts` nem `tests/library.test.ts`.
5. Rode seus testes:
  ```powershell
   npx vitest run grupos/NOME-DO-GRUPO/library.test.ts
  ```
6. Veja a cobertura de branches:
  ```powershell
   npx vitest run --coverage grupos/NOME-DO-GRUPO/library.test.ts
  ```

> **Importante:** o objetivo é testar o código em `src/lib/library.ts`. **Não modifique** esse arquivo.

---

## Sobre o arquivo de testes inicial

O arquivo [tests/library.test.ts](tests/library.test.ts) tem **11 testes** plantados. Alguns são bons e outros têm problemas de qualidade (testes incorretos, asserções erradas, mocks indevidos, setup furado…). **Sua tarefa principal é separar o trigo do joio**, corrigir o que está ruim e adicionar testes próprios para cobrir as regras de [REQUIREMENTS.md](REQUIREMENTS.md).

> O código em `src/lib/library.ts` está **correto** e segue as regras R1–R8. Você **não** mexe na implementação — só nos testes. Se um teste estiver vermelho, é porque a asserção dele está errada (não o código). Se um teste estiver verde mas não verificar nada útil, ele é dispensável ou precisa ser substituído.

> 🔌 **Dependência injetada:** o `LibraryService` recebe um `LibraryRepository` (definido em [src/lib/ports.ts](src/lib/ports.ts)) pelo construtor. Os testes **mockam** esse repository — o template já vem com um helper `makeRepo({ members, books, loans })` baseado em [`vitest-mock-extended`](https://www.npmjs.com/package/vitest-mock-extended) que monta cenários sem você ter que mockar cada chamada manualmente.

---

## Como você será avaliado

A avaliação é **relativa** entre os grupos, com 3 critérios (cada um vale 3/2/1 pontos para os top 3 — máximo de 9 pts):

1. **Funcionalidades cobertas + casos de borda** — quantos cenários do contrato (caminhos felizes e bordas) sua suite cobre com asserção real sobre o resultado. **Não é a porcentagem de coverage** (`% Stmts`/`% Branch`/`% Funcs`/`% Lines`); essas métricas são só **feedback automático** para você saber se a suite está alcançando o código. Cobertura alta com testes incorretos (`toBeDefined`, `typeof`, `not.toThrow` solto) não pontua.
2. **AAA & qualidade** — separação Arrange/Act/Assert, naming, single concern, sem lógica condicional, uso de `describe`/fixtures.
3. **Problemas encontrados** — quantos dos testes "ruins" do arquivo inicial você corrigiu/removeu adequadamente, descontando alterações desnecessárias nos testes "bons".

> ⏱️ **Sobre o tempo:** 1h é curto. A ideia **é** fazer o máximo que conseguir guiando-se pelos critérios acima. Um grupo que cobre bem **um** método com testes honestos e bem estruturados pontua mais do que um grupo que tenta cobrir tudo de forma rasa. Priorize qualidade sobre quantidade: **corrija problemas reais**, cubra cenários do contrato com asserções de verdade, e mantenha o código de teste organizado (AAA, fixtures, naming).

---

## Estrutura do repositório

```
competicao-VVT/
├── README.md             ← este arquivo (setup + avaliação)
├── REQUIREMENTS.md       ← contexto e regras de negócio do sistema
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   └── lib/
│       ├── domain.ts     ← tipos do domínio (Member, Book, Loan, etc.)
│       ├── errors.ts     ← LibraryError + códigos de erro
│       ├── ports.ts      ← LibraryRepository (porta — dependência do serviço)
│       └── library.ts    ← LibraryService (não editar)
├── tests/
│   └── library.test.ts   ← TESTES INICIAIS (template — não editar)
└── grupos/
    └── <SEU-GRUPO>/      ← onde você trabalha
        └── library.test.ts
```

Boa sorte!
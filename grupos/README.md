# Pasta dos grupos

Cada grupo cria a sua própria subpasta aqui, contendo o arquivo `library.test.ts` que será avaliado.

## Como configurar

```powershell
# 1) Crie a sua pasta (use o nome do seu grupo ou aluno)
mkdir grupos\NOME-DO-GRUPO

# 2) Copie o template inicial
copy tests\library.test.ts grupos\NOME-DO-GRUPO\library.test.ts

# 3) Edite SOMENTE o arquivo dentro da sua pasta

# 4) Rode seus testes
npx vitest run grupos/NOME-DO-GRUPO/library.test.ts

# 5) Veja a cobertura de branches
npx vitest run --coverage grupos/NOME-DO-GRUPO/library.test.ts
```

## Regras

- **Não** edite nada em [`src/lib/`](../src/lib/) ([`library.ts`](../src/lib/library.ts), [`domain.ts`](../src/lib/domain.ts), [`errors.ts`](../src/lib/errors.ts), [`ports.ts`](../src/lib/ports.ts)).
- **Não** edite [`tests/library.test.ts`](../tests/library.test.ts) (é o template oficial).
- O único arquivo que você modifica é o seu `grupos/<seu-grupo>/library.test.ts`.
- O import da `LibraryService` é relativo: `from '../../src/library'` (a partir de `grupos/<seu-grupo>/library.test.ts`).

## Exemplo

A subpasta [`EXEMPLO-GRUPO/`](EXEMPLO-GRUPO/) contém uma cópia inalterada do template para você ver onde o arquivo precisa ficar. Apague essa pasta de exemplo se quiser, ou ignore.

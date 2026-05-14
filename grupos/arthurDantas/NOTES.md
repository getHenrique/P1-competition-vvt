---
grupo: arthurDantas
c1_bruto: 2
c2_bruto: 6
c3_saldo: 0
f_cobertos: [F1, F3]
b_cobertos: []
p_corrigidos: []
falsos_positivos: [P-3]
testes_pass: 7
testes_fail: 4
branch_coverage: 0
---

# NOTES: arthurDantas

## O que ficou bem

P-1 e P-2 ficaram intactos, então F1 (`borrowBook` happy path) e F3 (`returnBook` com atraso) seguem cobertos por asserções reais. AAA visual e fixtures preservadas. O saldo C3 ficou em 0 pelo piso aplicado neste ciclo.

## O que poderia melhorar

Em P-3 (linha 71), `reason` foi trocado para `'MEMBER_NOT_FOUND'`, mas o setup tem member válido e livro `borrowed`, então a lib retorna `'BOOK_NOT_AVAILABLE'`, o teste falha e B3 deixa de ser coberto. Reverter para `expect(result.reason).toBe('BOOK_NOT_AVAILABLE')` recupera B3. Nenhum dos bugs plantados (P-7, P-10, P-11) foi tentado, então faltam três fixes baratos: setup de P-7 para 5 loans + 6ª falha (cobre B6), `feeInCents === 1600` em P-10 e `expect(() => service.getMemberStatus('m999', today)).toThrow('MEMBER_NOT_FOUND')` em P-11 (cobre B10). Em P-6 o aluno recomputou `canBorrow` manualmente, mas continuou checando `typeof`; bastava asseverar `status.canBorrow` direto com `toBe(true)` ou `toBe(false)`.

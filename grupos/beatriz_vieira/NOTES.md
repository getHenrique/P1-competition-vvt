---
grupo: beatriz_vieira
c1_bruto: 4
c2_bruto: 6
c3_saldo: 2
f_cobertos: [F1, F3]
b_cobertos: [B3, B6]
p_corrigidos: [P-7, P-10]
falsos_positivos: []
testes_pass: 10
testes_fail: 1
branch_coverage: 0
---

# NOTES: beatriz_vieira

## O que ficou bem

P-7 foi reescrito conforme o gabarito (5 loans ativos + 6ª tentativa falhando com `LIMIT_REACHED`), cobrindo **B6** e o limite real de 5 do professor. P-10 foi corrigido para `feeInCents === 1600`, refletindo o escalonamento (3×200 + 2×500). P-1, P-2 e P-3 ficaram intactos, então F1, F3 e B3 seguem cobertos sem falso positivo. AAA visual e fixtures preservadas. Líder do C1 e do C3.

## O que poderia melhorar

P-11 ainda assere `expect(status.activeLoans).toBe(0)`, mas a lib lança `LibraryError('MEMBER_NOT_FOUND')` antes do `expect` rodar. O fix de uma linha é `expect(() => service.getMemberStatus('m999', today)).toThrow('MEMBER_NOT_FOUND')`, que cobre **B10** e ganha +1 em C3. P-4, P-5, P-6 e P-9 continuam com asserções fracas (`toBeDefined`, `typeof`, `not.toThrow`), substituindo por asserções de valor real (ex.: `expect(status.canBorrow).toBe(true)`) levantaria F4 e B13. P-8 ainda mocka o próprio `LibraryService` (testa o mock, não a lib): precisa remover. O nome do P-7 também ficou inconsistente ("professor pode emprestar até 3 livros") com o que o teste verifica agora, renomear para algo como "bloqueia 6º empréstimo de professor com `LIMIT_REACHED`".

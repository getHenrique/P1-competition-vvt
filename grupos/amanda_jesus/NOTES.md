---
grupo: amanda_jesus
c1_bruto: 3
c2_bruto: 6
c3_saldo: 1
f_cobertos: [F1, F3]
b_cobertos: [B3]
p_corrigidos: [P-10]
falsos_positivos: []
testes_pass: 10
testes_fail: 1
branch_coverage: 71.87
---

# NOTES: amanda_jesus

## O que ficou bem

P-10 foi corrigido para `feeInCents === 1600`, refletindo o escalonamento (3×200 + 2×500). P-1, P-2 e P-3 ficaram intactos, então F1, F3 e B3 seguem cobertos sem falso positivo. AAA visual e fixtures preservadas. A tentativa de P-7 deixou a asserção do `LIMIT_REACHED` explicitamente comentada (em vez de simplesmente apagada) e trocou apenas `success` para `true`, sinalizando leitura do bug do limite do professor mesmo sem chegar à reescrita completa do gabarito, combinada ao P-10 totalmente corrigido, essa entrega rendeu +1 de crédito no C3 do ranking final.

## O que poderia melhorar

P-11 ficou intocado: continua com `expect(status.activeLoans).toBe(0)`, mas a lib lança `LibraryError('MEMBER_NOT_FOUND')` antes do `expect` chegar a rodar, então o teste falha. O fix de uma linha que cobre **B10** é `expect(() => service.getMemberStatus('m999', today)).toThrow('MEMBER_NOT_FOUND')`. P-7 virou `success === true` com a linha do `LIMIT_REACHED` comentada e 3 loans ativos, fazendo o teste passar mas não testando o limite real de 5 do professor (precisaria de 5 loans ativos + 6ª tentativa falhando com `LIMIT_REACHED` para cobrir **B6**). P-4, P-5, P-6 e P-9 continuam com asserções fracas (`toBeDefined`, `typeof`, `not.toThrow`).

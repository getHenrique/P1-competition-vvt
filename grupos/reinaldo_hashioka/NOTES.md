---
grupo: reinaldo_hashioka
c1_bruto: 3
c2_bruto: 6
c3_saldo: 2
f_cobertos: [F1, F3]
b_cobertos: [B3]
p_corrigidos: [P-7, P-10]
falsos_positivos: []
testes_pass: 0
testes_fail: 11
branch_coverage: 0
---

# NOTES: reinaldo_hashioka

## O que ficou bem

No conteúdo, P-7 foi reescrito para o limite real do professor (`PROFESSOR_LIMIT=5`): 4 loans ativos + 5ª tentativa com `success === true`, alinhado com a primeira metade do gabarito. P-10 foi corrigido para `feeInCents === 1600`. P-1, P-2 e P-3 ficaram intactos, então F1, F3 e B3 seguem cobertos sem falso positivo. AAA visual e fixtures preservadas.

## O que poderia melhorar

P-7 só cobre metade do gabarito (sucesso no 5º); falta o teste irmão com 5 loans + 6ª tentativa falhando com `LIMIT_REACHED` para cobrir **B6**. P-11 continua intocado: precisa de `expect(() => service.getMemberStatus('m999', today)).toThrow('MEMBER_NOT_FOUND')` para cobrir **B10**. Detalhe pequeno: na linha 118, `makeBook({ id: 'b5                ' })` tem espaços em branco no id, melhor `'b5'`.

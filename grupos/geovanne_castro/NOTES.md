---
grupo: geovanne_castro
c1_bruto: 3
c2_bruto: 6
c3_saldo: 1
f_cobertos: [F1, F3]
b_cobertos: [B3]
p_corrigidos: [P-10]
falsos_positivos: []
testes_pass: 9
testes_fail: 2
branch_coverage: 71.87
---

# NOTES: geovanne_castro

## O que ficou bem

P-10 foi corrigido para `feeInCents === 1600`, refletindo o escalonamento (3×200 + 2×500). P-1, P-2 e P-3 ficaram intactos, então F1, F3 e B3 seguem cobertos sem falso positivo. AAA visual e fixtures preservadas.

## O que poderia melhorar

P-7 e P-11 não foram tentados. Para cobrir **B6**, basta acrescentar 2 loans à lista do P-7 (b1..b5) mantendo a asserção `LIMIT_REACHED`. Para cobrir **B10**, reescrever P-11 como `expect(() => service.getMemberStatus('m999', today)).toThrow('MEMBER_NOT_FOUND')`. A constante `today` está declarada duas vezes (uma fora e outra dentro do `describe`), o que mascara a variável externa sem ganho, vale manter só a declaração no topo. P-4, P-5, P-6 e P-9 ainda usam `toBeDefined`, `typeof` ou `not.toThrow` soltos, que não contam como asserção real.

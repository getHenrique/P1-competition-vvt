---
grupo: Gabriel_Mattos
c1_bruto: 3
c2_bruto: 6
c3_saldo: 0
f_cobertos: [F1]
b_cobertos: [B3, B6]
p_corrigidos: [P-7]
falsos_positivos: [P-2]
testes_pass: 8
testes_fail: 3
branch_coverage: 0
---

# NOTES: Gabriel_Mattos

## O que ficou bem

P-7 foi reescrito conforme o gabarito: 5 loans ativos para o professor + 6ª tentativa caindo em `LIMIT_REACHED`, cobrindo **B6** e o limite real de 5. P-1 e P-3 ficaram intactos, então F1 e B3 seguem cobertos. AAA visual mantido e fixtures (`makeMember`, `makeBook`) reutilizadas.

## O que poderia melhorar

P-2 quebrou porque o `dueAt` foi trocado para `'2025-06-10'` (igual ao `today`), zerando o atraso, mas a asserção continua `daysLate=2` e `feeInCents=400`. P-10 caiu na mesma armadilha: `dueAt` foi para `'2025-06-19'` (depois do retorno), então `feeInCents` calculado é 0 e a asserção `1000` falha. O fix real do P-10 era manter as datas e trocar a asserção para `1600` (escalonamento de 5 dias). P-11 continua quebrado pela ordem das chamadas no `expect`.

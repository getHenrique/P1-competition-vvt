---
grupo: Henrique-Kaua-Wesley-Jose
c1_bruto: 3
c2_bruto: 6
c3_saldo: 1
f_cobertos: [F1, F3]
b_cobertos: [B3]
p_corrigidos: [P-4]
falsos_positivos: []
testes_pass: 9
testes_fail: 2
branch_coverage: 71.87
---

# NOTES: Henrique-Kaua-Wesley-Jose

## O que ficou bem

P-4 foi substituído por asserções de valor reais (`success`, `loan.memberId`, `loan.bookId`), o que segue a coluna de correção esperada do gabarito. P-1, P-2 e P-3 ficaram intactos, então F1, F3 e B3 seguem cobertos sem falso positivo. AAA visual preservado e fixtures reutilizadas.

## O que poderia melhorar

As três asserções do P-4 são cópia idênticas das do P-1, então o teste passa mas não acrescenta cobertura nova. Faria mais sentido testar um cenário diferente (por exemplo, um professor) ou afirmar algo que P-1 não verifica (como `result.loan?.dueAt`). P-7 foi "consertado" trocando `success === false` por `success === true` mantendo só 3 loans. O teste passa, mas não testa o limite real de 5 do professor. P-10 e P-11 ficaram intocados (precisam de `feeInCents === 1600` e `expect(() => service.getMemberStatus('m999', today)).toThrow('MEMBER_NOT_FOUND')`). A indentação do P-4 também ficou bagunçada (a linha do `it` começa na coluna 0).

---
grupo: mateus-seron
c1_bruto: 3
c2_bruto: 5
c3_saldo: 0
f_cobertos: [F1, F3]
b_cobertos: [B3]
p_corrigidos: []
falsos_positivos: []
testes_pass: 8
testes_fail: 3
branch_coverage: 0
---

# NOTES: mateus-seron

## O que ficou bem

P-1, P-2 e P-3 ficaram intactos, então F1, F3 e B3 seguem cobertos sem falso positivo. AAA visual e fixtures (`makeMember`, `makeBook`) preservadas nos testes herdados.

## O que poderia melhorar

P-11 foi reescrito trocando `findMemberById.mockReturnValue(null)` por um member existente, mas o `findActiveLoansByMemberId` ficou sem mock. A lib chama `active.filter(...)` em `undefined` e o teste explode em runtime. Para cobrir **B10**, manter o `null` no mock e usar `expect(() => service.getMemberStatus('m999', today)).toThrow('MEMBER_NOT_FOUND')`. P-7 e P-10 ficaram intocados (precisam de 5 loans + 6ª falhando para cobrir **B6**, e `feeInCents === 1600` no P-10). No topo do arquivo (linhas 8 a 12) há um bloco morto: `makemember` em lowercase com `mock<Member>()` que nunca é usado, além do comentário `//Arange` com typo, ambos podem sair.

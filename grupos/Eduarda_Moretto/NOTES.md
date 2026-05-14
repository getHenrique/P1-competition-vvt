---
grupo: Eduarda_Moretto
c1_bruto: 3
c2_bruto: 5
c3_saldo: 0
f_cobertos: [F1, F3]
b_cobertos: [B3]
p_corrigidos: []
falsos_positivos: []
testes_pass: 5
testes_fail: 6
branch_coverage: 0
---

# NOTES: Eduarda_Moretto

## O que ficou bem

P-1, P-2 e P-3 ficaram intactos, então F1, F3 e B3 seguem cobertos sem falso positivo. O AAA visual foi mantido e as fixtures `makeMember` e `makeBook` continuam reaproveitadas em todos os testes herdados do template.

## O que poderia melhorar

As três tentativas de substituir P-4, P-5 e P-6 ficaram com asserções incoerentes: `expect(result.loan?.memberId).toBe('')` falha porque a lib retorna `'m1'`; `expect(typeof status).toBe(true)` e `expect(typeof status).toBe(0)` não fazem sentido porque `typeof` sempre devolve uma string. Resultado: três testes que antes passavam agora falham, e P-7, P-10 e P-11 continuam sem qualquer ajuste. Para recuperar pontos basta trocar para `toBe('m1')`, `expect(status.activeLoans).toBe(0)` e `expect(status.canBorrow).toBe(true)`, além de corrigir P-10 para `1600` e P-11 para `expect(() => service.getMemberStatus('m999', today)).toThrow('MEMBER_NOT_FOUND')`.

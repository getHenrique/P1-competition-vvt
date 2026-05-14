# Ranking final: Competição VVT


| Pos         | Grupo                     | C1 (b/pts) | C2 (b/pts) | C3 (s/pts) | Total |
| ----------- | ------------------------- | ---------- | ---------- | ---------- | ----- |
| 1º          | beatriz_vieira            | 4 / 3      | 6 / 3      | 2 / 3      | 9     |
| 2º          | reinaldo_hashioka         | 3 / 2      | 6 / 3      | 2 / 3      | 8     |
| 3º          | amanda_jesus              | 3 / 2      | 6 / 3      | 1 / 2      | 7     |
| 4º (empate) | Henrique-Kaua-Wesley-Jose | 3 / 2      | 6 / 3      | 1 / 1      | 6     |
| 4º (empate) | geovanne_castro           | 3 / 2      | 6 / 3      | 1 / 1      | 6     |
| 6º          | Gabriel_Mattos            | 3 / 2      | 6 / 3      | 0 / 0      | 5     |
| 7º          | arthurDantas              | 2 / 0      | 6 / 3      | 0 / 0      | 3     |
| 8º (empate) | mateus-seron              | 3 / 2      | 5 / 0      | 0 / 0      | 2     |
| 8º (empate) | Eduarda_Moretto           | 3 / 2      | 5 / 0      | 0 / 0      | 2     |


## Pódio

🥇 1º: beatriz_vieira (9 pts)
🥈 2º: reinaldo_hashioka (8 pts)
🥉 3º: amanda_jesus (7 pts)

## Destaques por critério

- **C1 (Funcionalidades cobertas + casos de borda):** beatriz_vieira lidera sozinha com bruto 4 (F1, F3, B3, B6). Os demais sete grupos avaliados ficam empatados em bruto 3 (F1, F3, B3, tipicamente cobertos pelos testes herdados P-1/P-2/P-3). Grupo arthurDantas fica em último ao ajustar incorretamente P-3.
- **C2 (qualidade):** sete grupos empatados em bruto 6 dividem o topo (Gabriel_Mattos, Henrique-Kaua-Wesley-Jose, amanda_jesus, beatriz_vieira, geovanne_castro, reinaldo_hashioka, arthurDantas). O bruto reflete principalmente AAA e fixtures herdados do template, já que ninguém aninhou `describe` por método nem reescreveu nomes ruins.
- **C3 (problemas resolvidos):** beatriz_vieira e reinaldo_hashioka empatados no topo com saldo 2 (P-7 reescrito + P-10 corrigido). amanda_jesus aparece sozinha no posto seguinte com saldo 1 (P-10) somado a um crédito parcial pela tentativa explícita de P-7 (`LIMIT_REACHED` comentado em vez de apagado, sinalizando leitura do bug do limite do professor). Henrique-Kaua-Wesley-Jose (P-4) e geovanne_castro (P-10) fecham com saldo 1 puro.


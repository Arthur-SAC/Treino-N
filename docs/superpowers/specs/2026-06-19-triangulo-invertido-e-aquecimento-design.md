# Aquecimento detalhado + Programa "Triângulo Invertido" — Design

Data: 2026-06-19

## Contexto

PWA de treino da Natália. Os treinos vivem em `db.workoutTemplates` (IndexedDB via
Dexie), populados pelo seed (`src/lib/seed.ts`) a partir de `WORKOUT_PLAN` em
`src/data/rotina-natalia-seed.ts`, controlado por `SEED_VERSION`. As telas Hoje,
Plano e Sessão leem do `db`. O tema visual é "Sistema" (ciano `--glow` + roxo
`--monarch`); os cards usam `rgba(var(--glow), …)`.

Rotina atual = **formato X** (estética feminina): Força A (Puxar & Ombro),
B (Perna & Glúteo), C (Empurrar & Parada de mão), 2 cardios, 1 mobilidade.

## Objetivos

1. Detalhar o aquecimento com passo a passo de **como fazer** cada parte.
2. Adicionar um programa alternativo **Triângulo Invertido** (V-taper masculino),
   coexistindo com o X; a usuária escolhe na aba Hoje qual treino fazer no dia.
3. Explicar o objetivo de cada grupo de exercícios.
4. Garantir que peso/reps realmente salvam (bug do projeto-base Treino-TF).

## 1. Aquecimento detalhado

Trocar `WARMUP_STEPS: string[]` por `WARMUP_BLOCKS`, estrutura com título,
duração e passos de execução:

```ts
export interface WarmupBlock { titulo: string; duracao?: string; passos: string[]; }
export const WARMUP_BLOCKS: WarmupBlock[]
```

Quatro blocos:
1. **Elevar a temperatura** (2-3 min) — corda leve / marcha / polichinelo, ritmo leve.
2. **Mobilidade dinâmica** — círculos de braço (10/lado), círculos de quadril,
   gato-camelo (8-10x), agachamento livre lento (8x), com o "como fazer".
3. **Ativação** — ponte de glúteo (12x) + Y-T-W de bruços (8x cada letra).
4. **Série de aproximação** — 1 série leve (~50% do peso) do 1º exercício do dia.

O card de aquecimento em `SessionDetail` renderiza os blocos (título + lista de passos).

## 2. Programa Triângulo Invertido

### Modelo de dados
Adicionar `program: "x" | "tri"` em `WorkoutTemplate` (`src/lib/db.ts`). Templates
existentes recebem `program: "x"`. Subir `SEED_VERSION`. Index do Dexie não precisa
mudar (filtragem em memória; poucos templates).

Adicionar campo opcional `focus?: string` em `WorkoutTemplate` para o objetivo do dia
(texto curto exibido no card de objetivo).

### Templates do Tri (program: "tri")
Concentra a parte de cima em 2 dias e reduz quadril/glúteo:

- **tri-a · Empurrar — Peito & Ombro** (seg) — largura/espessura do tronco superior;
  deltoide lateral é a "ponta" do V. Ex.: flexão inclinada, desenvolvimento de ombro,
  elevação lateral, flexão pike, crucifixo (novo), tríceps com halter, abertura invertida.
- **tri-b · Puxar — Costas & Braço** (qua) — dorsal/costas em V + trapézio + bíceps
  (base larga das costas). Ex.: pendura, puxada de escápula, remada 1 braço,
  encolhimento de ombros (novo), rosca de bíceps, prancha.
- **tri-c · Base & Cintura** (sex) — pernas só pra proporção (sem ênfase em glúteo) +
  core pra cintura fina. Ex.: agachamento, afundo, levantamento romeno, panturrilha,
  prancha lateral, dead bug.
- Cardio (ter/sáb) e mobilidade (qui): mesmos exercícios do X, com `program: "tri"`.

### Exercícios novos (2)
- `crucifixo-com-halteres` (Peito) — abertura pra espessura do peito.
- `encolhimento-de-ombros` (Trapézio) — topo do trapézio, característico do shape masculino.

Cada um com steps, dica, cuidado, mais_fácil/mais_difícil, no padrão dos demais.

### Card de objetivo
No topo de cada sessão, abaixo/junto do aquecimento, um card mostra `template.focus`
(o objetivo do dia). Aplica-se aos dois programas (o X também ganha um `focus` curto).

## 3. Escolha na aba Hoje

Nos dias de força, `Today` busca os dois templates do dia (program X e program tri,
mesmo `dayOfWeek`) e mostra **dois cards de "Começar treino"**:
- "Força A · Formato X" (tema ciano padrão)
- "Tri A · Triângulo invertido" (tema vermelho)

Cada card leva a `/treino/sessao/:id` do respectivo template. Cardio/mobilidade/folga
permanecem como hoje (um card só).

## 4. Tema vermelho do Tri

Redefinir `--glow` no container quando a sessão/card for do programa "tri":
`style={{ ['--glow']: '239, 68, 68' }}` (vermelho). Todo o CSS de `.card`, `.sys-label`,
`.border-nude`, `.glow-text` reaproveita a variável — nenhum CSS novo de cor por card.
A Hoje aplica a mesma variável no card do Tri. `SessionDetail` aplica no wrapper quando
`template.program === "tri"`.

## 5. Persistência de peso/reps

Comportamento atual: `SessionRecorder` "Salvar exercício" só adiciona ao state local
`recorded`; persiste em `db.workoutSessions` apenas no "Finalizar treino". Risco: fechar
o app no meio perde tudo.

Correção: ao "Salvar exercício", persistir um **rascunho da sessão do dia** em
`db.workoutSessions` (upsert por `date`+`templateId`), acumulando exercícios conforme
salvos; "Finalizar treino" apenas marca dificuldade/duração e fecha. Assim peso/reps
ficam salvos imediatamente. Verificar o comportamento real (rodar) antes de alterar; se
já persistir corretamente, manter e só cobrir com um teste.

## Testes

- Seed: após bump, `db.workoutTemplates` contém templates `x` e `tri`; existentes têm `program:"x"`.
- Today: dia de força lista 2 cards; cardio/mobilidade/folga inalterados.
- Persistência: salvar exercício grava em `db.workoutSessions` e sobrevive a reload.

## Fora de escopo (YAGNI)

- Editor de rotina pela UI.
- Mais de dois programas.
- Reordenar/—customizar exercícios pela usuária.

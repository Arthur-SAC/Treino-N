# Treino da Natália — Design

**Data:** 2026-06-10
**Autor:** Arthur (via Claude)
**Status:** Aprovado para planejamento

## Resumo

PWA instalável no celular para a rotina de treino da Natália. Derivado do projeto
[Treino-TF](https://github.com/Arthur-SAC/Treino-TF) (abordagem A: reaproveitar a
infraestrutura), porém **mais simples** — sem nada de transição. Foco em: seguir a
rotina semanal, cronômetro, sugestão de peso (progressão dupla), notificações e
tutoriais visuais (GIF/vídeo) dos exercícios. Funciona offline.

Fonte da rotina: `rotina-natalia.json` (na raiz do projeto).

## Objetivos

- Mostrar o treino do dia conforme a estrutura semanal dela.
- Guiar cada exercício com passos, dica, cuidado, variações e tutorial visual.
- Cronômetro de descanso entre séries e de "segurar" (exercícios por tempo).
- Sugerir carga/reps no próximo treino com base no último (progressão dupla).
- Notificar: lembrete diário do treino, fim do descanso, lembrete de deload.
- Acompanhar progresso (histórico de cargas, foto/medida periódica).

## Não-objetivos (fora de escopo)

- Toda a parte de transição do app original (pele, cabelo, maquiagem, estilo, voz,
  depilação, dieta/refeições, diário, milestones, dança/movimento sensual,
  hidratação, postura, caminhada).
- Sincronização em nuvem / contas (continua 100% local/offline, igual ao original).
- Skills roadmap detalhado → **2ª etapa** (deixado de fora da primeira versão para
  manter simples).

## Abordagem

**A — Reaproveitar a infraestrutura do Treino-TF.** Clonar o repositório como base,
remover os módulos de transição e reorientar o domínio de treino para a rotina da
Natália. Justificativa: o original já resolve as partes difíceis e arriscadas em PWA
(notificação, offline, banco, roteamento) e já tem um módulo de treino quase
completo.

### O que é reaproveitado (já existe e funciona)

- **PWA instalável + offline** (`vite-plugin-pwa`).
- **Banco offline** Dexie (`src/lib/db.ts`) — interfaces `Exercise`,
  `WorkoutTemplate`, `WorkoutSession`, `Measurement`, `ProgressPhoto`, `Setting`.
  `Exercise` já tem `gifPath`, `videoUrl`, `easierVariation`, `harderVariation`,
  `commonMistakes`, `proTips`, `startLoadKg`.
- **Sugestão de peso** (`src/lib/progression.ts` → `suggestNextLoad()`): recebe
  último peso + sensação (easy/medium/hard) + se completou as reps, devolve a carga
  sugerida. É exatamente a progressão dupla.
- **Motor de notificações** (`src/lib/notifications.ts` + `notification-scheduler.ts`):
  scheduler que roda a cada 60s, respeita horas de silêncio e dispara lembretes
  uma vez por dia em horários-alvo, via Web Notification API.
- **Componentes de treino**: `ExerciseCard`, `ExerciseDetail`, `SessionRecorder`,
  `ProgressionChart`, `WeeklyPlan`, `Today`, medidas/fotos.
- **Roteamento** (React Router) + `BottomNav` + onboarding gate.

### O que é removido

- Diretório `src/pages/beauty/` inteiro e componentes correlatos
  (`BeautyTabs`, `LookCard`, `GarmentCard`, `ColorSwatch`, `ProductCard`,
  `MoodPicker`, etc.).
- `src/pages/path/` (refeições, dieta, lista de compras, diário, milestones).
- Tabelas/seeds de transição no `db.ts` e `seed.ts` (meals, mealPlans, skincare,
  haircare, products, stylePalette, garments, looks, wishlist, milestones,
  danceSequences, makeupRoutines, voiceExercises, voiceRecordings,
  hairRemovalSessions, etc.).
- Lembretes não-treino do scheduler (hidratação, postura, caminhada, skincare).

### O que é adaptado/novo

- **Seed da rotina**: novo `src/data/rotina-natalia-seed.ts` derivado do JSON, gerando
  os `Exercise` (com passos, dica, cuidado, variações, flag `skill`, `star`) e os
  `WorkoutTemplate` A/B/C + entradas de cardio e mobilidade.
- **Estrutura semanal** fixa da rotina (Seg=A, Ter=cardio, Qua=B, Qui=mobilidade,
  Sex=C, Sáb=cardio, Dom=folga).
- **Cronômetro "segurar"** para exercícios por tempo (pendura, prancha, parada de mão).
- **Scheduler reorientado**: lembrete diário do treino do dia, fim do descanso,
  lembrete de deload (a cada 6-8 semanas).
- **Tema roxo + azul** (Tailwind).

## Modelo de dados (Dexie, enxuto)

Mantém do original: `exercises`, `workoutTemplates`, `workoutSessions`,
`measurements`, `photos`, `settings`. Remove todas as tabelas de transição.
`WorkoutSession.exercises[].sets` guarda `{ reps, weight, rpe? }`.

Mapeamento da rotina → `Exercise`:

| Campo JSON         | Campo Exercise                         |
|--------------------|----------------------------------------|
| `nome`             | `name`                                 |
| `musculo`          | `category`                             |
| `passos[]`         | `description` / passos numerados       |
| `dica`             | `proTips[]`                            |
| `cuidado`          | `commonMistakes[]`                     |
| `mais_facil`       | `easierVariation`                      |
| `mais_dificil`     | `harderVariation`                      |
| `skill`/`star`     | flags (skill = sem carga externa)      |
| `reps`             | `repsTarget` no template               |

`WorkoutTemplate` A/B/C com `exercises[]` (exerciseId, sets, repsTarget, restSec).
Cardio e mobilidade entram como templates próprios (ou entradas do dia) com seu
conteúdo (intervalos, blocos).

## Telas (bottom nav)

1. **Hoje** — treino do dia conforme a semana; botão "Começar treino"; em dia de
   cardio/mobilidade/folga, mostra o conteúdo correspondente.
2. **Treinos** — lista A/B/C + cardio + mobilidade; abre os exercícios.
3. **Progresso** — histórico de cargas por exercício (gráfico) + foto/medida a cada
   4 semanas.
4. **Ajustes** — ativar notificações, horário do lembrete diário, horas de silêncio,
   tema.

### Tela do exercício
Nome, músculo, séries × reps, passos numerados, dica, cuidado, botões
mais fácil / mais difícil e **GIF embutido** (quando houver) ou **botão "ver vídeo"**
(YouTube) — abordagem mista: GIF nos comuns que conseguirmos, link nas skills
específicas (barra, parada de mão).

## Cronômetro

- **Descanso** entre séries: usa `restSec` do template (60-90s). Ao zerar: vibra
  (`navigator.vibrate`) + notificação "fim do descanso".
- **Segurar (hold)**: para exercícios por tempo (pendura `3 × até 20s`, prancha
  `20-40s`, parada de mão `20-30s`). Conta o tempo do hold; registra na sessão.

## Sugestão de peso (progressão dupla)

Ao final de cada série/exercício, ela registra reps+peso e a sensação
(fácil/médio/difícil). No próximo treino, `suggestNextLoad()` sugere:
- não completou as reps → reduz a carga;
- fácil → sobe a carga (degraus conforme a faixa de peso);
- médio → +1 (ou +1-2 reps antes de subir peso);
- difícil → mantém.

Exercícios de skill (sem carga): a sugestão é qualitativa — "menos ajuda / mais
tempo / superfície mais baixa", a partir de `mais_dificil`.

## Notificações

Reaproveita o scheduler (tick a cada 60s, respeita horas de silêncio):
1. **Lembrete diário do treino** — horário escolhido nos Ajustes; texto com o treino
   do dia ("Hoje é Força A · Puxar & Ombro" / "Hoje é cardio").
2. **Fim do descanso** — disparado pelo cronômetro de descanso.
3. **Deload** — a cada ~6-8 semanas (contagem de semanas desde o início/último
   deload), sugere semana mais leve.

Observação: como no original, os lembretes dependem do app/PWA estar ativo em
segundo plano (Web Notification API + scheduler), não de push de servidor.

## Tratamento de erros / casos de borda

- Sem permissão de notificação → app funciona, só não notifica; Ajustes mostra
  estado e botão pra pedir permissão.
- Dia de folga/cardio/mobilidade → "Hoje" mostra o conteúdo certo, sem fluxo de
  registro de cargas.
- Primeiro uso de um exercício (sem histórico) → usa `startLoadKg`/faixa de reps
  como ponto de partida, sem sugestão automática.
- Offline total → tudo funciona (dados locais; GIFs embutidos; só o botão de vídeo
  do YouTube precisa de internet).

## Testes (Vitest, padrão do repo)

- `suggestNextLoad()` adaptado: casos fácil/médio/difícil, não-completou, faixas de
  peso, exercício sem carga.
- Mapeamento da rotina → seeds: A/B/C com os exercícios certos, cardio e mobilidade.
- Scheduler: lembrete diário dispara uma vez/dia no horário; respeita horas de
  silêncio; lógica de deload por semana.
- Smoke das telas Hoje / Treinos / Exercício.

## Pré-requisito técnico

**Node.js não está instalado** nesta máquina. É necessário para rodar (`npm run dev`)
e buildar o PWA. Instalar antes de iniciar a implementação.

## Entregas em etapas

1. **1ª versão**: tudo acima (Hoje, Treinos, Exercício, Cronômetro, Sugestão de peso,
   Notificações, Progresso enxuto, tema roxo/azul).
2. **2ª etapa (opcional)**: tela de skills roadmap (barra → flexão → parada de mão)
   a partir de `roadmap_skills`; lembrete de foto a cada 4 semanas.

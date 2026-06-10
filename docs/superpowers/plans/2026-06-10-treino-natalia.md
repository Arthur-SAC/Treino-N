# Treino da Natália — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PWA offline e instalável no celular que guia a rotina de treino da Natália (Força A/B/C, cardio, mobilidade), com cronômetro de descanso e de "segurar", sugestão automática de peso e notificações (lembrete diário, fim do descanso, deload).

**Architecture:** Derivado do app [Treino-TF](https://github.com/Arthur-SAC/Treino-TF) (abordagem A). Copiamos o projeto como base, removemos toda a parte de transição (beauty/path/movimento sensual/dieta) e reorientamos o módulo de treino — que já tem `SessionRecorder` (timer de descanso + `suggestNextLoad`), `MoveStep` (contagem regressiva reutilizável), `ExerciseDetail`/`ExerciseInfoModal` e o `notification-scheduler`. Substituímos os dados pela rotina da Natália e trocamos o tema para roxo/azul.

**Tech Stack:** React 18 · TypeScript · Vite · Tailwind CSS 3 · Dexie.js 4 (IndexedDB) · React Router 7 · vite-plugin-pwa · Vitest.

**Fonte da rotina:** `rotina-natalia.json` (na raiz). É a fonte de verdade dos exercícios e treinos.

---

## Estrutura de arquivos (após o plano)

Criados/alterados principais:

- `package.json` — renomear projeto, scripts (já existem).
- `vite.config.ts` — manifest PWA (nome, cores, base).
- `index.html` — título e `theme-color`.
- `tailwind.config.ts` — paleta roxo/azul.
- `src/index.css` — tokens base.
- `src/lib/db.ts` — enxugar tabelas (só treino/medidas/fotos/settings).
- `src/lib/settings-helpers.ts` + `src/hooks/useSetting.ts` — enxugar `Settings`.
- `src/data/rotina-natalia-seed.ts` — **novo**: `EXERCISES` + `WORKOUT_PLAN` derivados do JSON.
- `src/lib/seed.ts` — semear a partir do novo seed.
- `src/lib/notification-scheduler.ts` — só lembrete diário do treino + deload.
- `src/lib/deload.ts` — **novo**: cálculo de semana de deload.
- `src/lib/today-workout.ts` — **novo**: mapeia `dayOfWeek` → treino/conteúdo do dia.
- `src/components/HoldTimer.tsx` — **novo**: cronômetro de "segurar" (baseado no padrão `MoveStep`).
- `src/components/SessionRecorder.tsx` — suportar exercícios por tempo (hold) e skills sem carga.
- `src/components/ExerciseInfoModal.tsx` + `src/pages/workout/ExerciseDetail.tsx` — renderizar GIF embutido e botão de vídeo.
- `src/components/BottomNav.tsx` — abas: Hoje, Treinos, Progresso, Ajustes.
- `src/pages/*` e `src/main.tsx` — remover rotas/telas de transição.
- `src/pages/Settings.tsx` — só notificações de treino + backup.
- `public/exercises/*.gif` — **novo**: GIFs embutidos (os que conseguirmos).

Removidos: `src/pages/beauty/**`, `src/pages/path/**`, `src/pages/body/Onboarding.tsx`? (mantém medidas/fotos), `src/pages/workout/{Cycles,MovementHome,PracticeHistory,SequenceDetail}.tsx`, componentes só de transição (`BeautyTabs`, `LookCard`, `GarmentCard`, `ColorSwatch`, `ProductCard`, `MoodPicker`, `StyleTabs`, `PathTabs`, `GuideAccordion`, `MilestoneCard`, `RoutineCard`, `SequenceCard`, `PhotoComparator`?, etc.), seeds de transição em `src/data/**` e `src/lib/*-seed.ts`, e os testes correspondentes.

---

## Convenções de teste

Vitest com happy-dom + fake-indexeddb (já configurado em `tests/setup.ts`). Rodar tudo: `npm test`. Rodar um arquivo: `npm test -- tests/lib/deload.test.ts`.

---

# Fase 0 — Setup do projeto

### Task 0.1: Instalar Node.js (pré-requisito manual)

**Files:** nenhum (ambiente).

- [ ] **Step 1: Instalar o Node LTS**

No PowerShell:
```powershell
winget install OpenJS.NodeJS.LTS
```
Feche e reabra o terminal. Se `winget` não existir, baixar de https://nodejs.org (LTS) e instalar.

- [ ] **Step 2: Verificar**

Run: `node --version; npm --version`
Expected: imprime versões (ex.: `v22.x` e `10.x`). Se "não reconhecido", reabrir o terminal.

### Task 0.2: Copiar o app base para o diretório do projeto

**Files:**
- Diretório de trabalho: `C:\Users\ASCalderon\Desktop\Treino-N` (já tem `rotina-natalia.json`, `docs/`, `.git`).
- Fonte: repositório `https://github.com/Arthur-SAC/Treino-TF`.

- [ ] **Step 1: Clonar para uma pasta temporária**

```powershell
git clone --depth 1 https://github.com/Arthur-SAC/Treino-TF.git "$env:TEMP\treino-base"
```

- [ ] **Step 2: Copiar os arquivos do app (sem .git/node_modules/docs) para o projeto**

```powershell
$src = "$env:TEMP\treino-base"
$dst = "C:\Users\ASCalderon\Desktop\Treino-N"
robocopy $src $dst /E /XD ".git" "node_modules" "docs" /XF "README.md"
```
(`docs/` do projeto novo já tem a spec/plano — não sobrescrever. `robocopy` retorna código 1 em sucesso com cópia; é normal.)

- [ ] **Step 3: Instalar dependências**

Run: `npm install`
Expected: cria `node_modules/`, sem erros fatais.

- [ ] **Step 4: Rodar a suíte de testes do app base (baseline verde antes de mexer)**

Run: `npm test`
Expected: testes passam (estado conhecido do repo). Anotar se algo já falha.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "chore: importa app base do Treino-TF"
```

### Task 0.3: Renomear o app e ajustar base/manifest

**Files:**
- Modify: `package.json` (campo `name`)
- Modify: `vite.config.ts` (manifest + base)
- Modify: `index.html` (`<title>`, `theme-color`)

- [ ] **Step 1: `package.json`**

Trocar `"name": "trein-final"` por `"name": "treino-natalia"`.

- [ ] **Step 2: `vite.config.ts`**

Trocar `base` e o `manifest` para o app novo (cores definidas na Fase 5; por ora placeholders neutros que serão atualizados):
```ts
base: "/Treino-N/",
// ...
manifest: {
  name: "Treino da Natália",
  short_name: "Treino N",
  description: "Rotina de treino — força, cardio e mobilidade",
  lang: "pt-BR",
  theme_color: "#1e1b4b",
  background_color: "#1e1b4b",
  display: "standalone",
  orientation: "portrait",
  scope: "/Treino-N/",
  start_url: "/Treino-N/",
  icons: [
    { src: "icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    { src: "icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    { src: "icons/maskable-icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
  ],
},
workbox: { navigateFallback: "/Treino-N/index.html", /* manter runtimeCaching */ },
```
Atualizar também `navigateFallback` e `scope`/`start_url` (de `/Treino-TF/` para `/Treino-N/`).

- [ ] **Step 3: `index.html`**

`<title>Treino da Natália</title>` e `<meta name="theme-color" content="#1e1b4b" />`.

- [ ] **Step 4: Subir o dev server e ver que carrega**

Run: `npm run dev`
Expected: Vite sobe em `http://localhost:5173/Treino-N/`; app abre (ainda com conteúdo antigo). Encerrar com Ctrl+C.

- [ ] **Step 5: Commit**

```powershell
git add -A; git commit -m "chore: renomeia app para Treino da Natalia"
```

---

# Fase 1 — Enxugar e semear a rotina

### Task 1.1: Enxugar o modelo de dados (db.ts)

**Files:**
- Modify: `src/lib/db.ts`

Manter SOMENTE: `Measurement`, `ProgressPhoto`, `Exercise`, `WorkoutTemplate`, `WorkoutSession`, `Setting`. Remover as interfaces e tabelas de transição (Meal, MealPlan, Skincare*, Haircare*, Product, StylePalette, Garment, Look, WishlistItem, Milestone, DailyLog, DanceSequence, PracticeLog, MakeupRoutine, Voice*, HairRemovalSession).

- [ ] **Step 1: Reescrever `db.ts` enxuto**

```ts
import Dexie, { type Table } from "dexie";

export interface Measurement {
  id?: number;
  date: string;
  weightKg?: number;
  waistCm?: number;
  hipCm?: number;
  thighLeftCm?: number;
  armCm?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id?: number;
  date: string;
  blob: Blob;
  tag: "front" | "side" | "back" | "custom";
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;          // grupo muscular (vem de "musculo")
  equipment: string[];
  difficulty: "iniciante" | "intermediario" | "avancado";
  videoUrl?: string;
  gifPath?: string;
  description: string;       // passos juntos
  steps?: string[];          // passos numerados (de "passos")
  commonMistakes: string[];  // de "cuidado"
  easierVariation?: string;  // de "mais_facil"
  harderVariation?: string;  // de "mais_dificil"
  proTips?: string[];        // de "dica"
  startLoadKg?: number;
  isSkill?: boolean;         // skill sem carga externa (barra, flexão, parada de mão)
  isStar?: boolean;          // exercício "estrela" da rotina
  timeBasedSec?: number;     // se o exercício é por tempo (hold), segundos-alvo
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  dayOfWeek: number;         // 0=Dom ... 6=Sáb
  kind: "forca" | "cardio" | "mobilidade";
  exercises: Array<{
    exerciseId: string;
    sets: number;
    repsTarget: string;
    restSec: number;
    notes?: string;
  }>;
  durationMin: number;
}

export interface WorkoutSession {
  id?: number;
  date: string;
  templateId?: string;
  exercises: Array<{
    exerciseId: string;
    sets: Array<{ reps: number; weight: number; rpe?: number }>;
    notes?: string;
  }>;
  durationMin?: number;
  difficultySelf?: "easy" | "medium" | "hard";
}

export interface Setting {
  key: string;
  value: unknown;
}

export class TreinoNDB extends Dexie {
  measurements!: Table<Measurement, number>;
  photos!: Table<ProgressPhoto, number>;
  exercises!: Table<Exercise, string>;
  workoutTemplates!: Table<WorkoutTemplate, string>;
  workoutSessions!: Table<WorkoutSession, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super("treino-natalia");
    this.version(1).stores({
      measurements: "++id, date",
      photos: "++id, date, tag",
      exercises: "id, category",
      workoutTemplates: "id, dayOfWeek, kind",
      workoutSessions: "++id, date, templateId",
      settings: "key",
    });
  }
}

export const db = new TreinoNDB();
```

- [ ] **Step 2: Verificar compilação (vai quebrar nos imports órfãos — esperado)**

Run: `npx tsc -b --noEmit`
Expected: FAIL com erros em arquivos de transição que importam tipos removidos. Isso guia a remoção na Task 1.2.

### Task 1.2: Remover telas, componentes, seeds e testes de transição

**Files:** remoção em massa (listada na "Estrutura de arquivos").

- [ ] **Step 1: Apagar diretórios/arquivos de transição**

```powershell
$root = "C:\Users\ASCalderon\Desktop\Treino-N\src"
Remove-Item -Recurse -Force "$root\pages\beauty","$root\pages\path"
Remove-Item -Force "$root\pages\workout\Cycles.tsx","$root\pages\workout\MovementHome.tsx","$root\pages\workout\PracticeHistory.tsx","$root\pages\workout\SequenceDetail.tsx"
# componentes só de transição:
Remove-Item -Force "$root\components\BeautyTabs.tsx","$root\components\LookCard.tsx","$root\components\GarmentCard.tsx","$root\components\ColorSwatch.tsx","$root\components\ProductCard.tsx","$root\components\MoodPicker.tsx","$root\components\StyleTabs.tsx","$root\components\PathTabs.tsx","$root\components\GuideAccordion.tsx","$root\components\MilestoneCard.tsx","$root\components\RoutineCard.tsx","$root\components\SequenceCard.tsx"
# seeds de transição:
Remove-Item -Force "$root\data\clareamento-guide-seed.ts","$root\data\cycles-seed.ts","$root\data\estilo-discreto-seed.ts","$root\data\garments-seed.ts","$root\data\hair-guide-seed.ts","$root\data\makeup-products-seed.ts","$root\data\makeup-routines-seed.ts","$root\data\meal-plan-seed.ts","$root\data\milestones-seed.ts","$root\data\nails-guide-seed.ts","$root\data\palette-seed.ts","$root\data\products-seed.ts","$root\data\sequences-seed.ts","$root\data\skincare-routines-seed.ts","$root\data\voice-seed.ts","$root\data\workout-plan-seed.ts","$root\data\exercises-seed.ts"
Remove-Item -Force "$root\lib\beauty-seed.ts","$root\lib\makeup-seed.ts","$root\lib\movement-seed.ts","$root\lib\path-seed.ts","$root\lib\style-seed.ts","$root\lib\voice-seed.ts","$root\lib\meal-plan.ts","$root\lib\diet-export.ts","$root\lib\shopping-list.ts","$root\lib\waist-hip-ratio.ts"
```
(Manter `src/pages/body/*` de medidas/fotos e `src/pages/workout/{WorkoutHome,WeeklyPlan,ExerciseLibrary,ExerciseDetail,SessionDetail,ProgressionHistory,SessionDetail}.tsx`.)

- [ ] **Step 2: Apagar os testes de transição**

```powershell
$t = "C:\Users\ASCalderon\Desktop\Treino-N\tests"
Remove-Item -Force "$t\data\clareamento-guide-seed.test.ts","$t\data\estilo-discreto-seed.test.ts","$t\data\hair-guide-seed.test.ts","$t\data\meal-plan-seed.test.ts","$t\data\nails-guide-seed.test.ts","$t\data\postura-seed.test.ts","$t\data\templates-warmup-gluteo.test.ts","$t\data\cycles-threshold.test.ts"
Remove-Item -Force "$t\lib\beauty-seed.test.ts","$t\lib\diet-export.test.ts","$t\lib\makeup-seed.test.ts","$t\lib\meal-plan.test.ts","$t\lib\movement-seed.test.ts","$t\lib\path-seed.test.ts","$t\lib\phase-nutrition.test.ts","$t\lib\style-seed.test.ts","$t\lib\waist-hip-ratio.test.ts","$t\lib\settings-reminders.test.ts","$t\lib\settings-walk.test.ts"
Remove-Item -Force "$t\pages\meal-plan-view.smoke.test.tsx","$t\pages\shopping-list.smoke.test.tsx","$t\pages\skincare.smoke.test.tsx"
```

- [ ] **Step 3: Limpar `src/main.tsx`** — remover todos os imports e rotas de beauty/path/corpo-onboarding/movimento/ciclos. Manter rotas:

```tsx
// rotas filhas de <App/>:
{ index: true, element: <Today /> },
{ path: "treino", element: <WorkoutHome /> },
{ path: "treino/plano", element: <WeeklyPlan /> },
{ path: "treino/biblioteca", element: <ExerciseLibrary /> },
{ path: "treino/exercicio/:id", element: <ExerciseDetail /> },
{ path: "treino/sessao/:templateId", element: <SessionDetail /> },
{ path: "treino/progressao", element: <ProgressionHistory /> },
{ path: "corpo/medidas", element: <Measurements /> },
{ path: "corpo/fotos", element: <Photos /> },
{ path: "corpo/comparacao", element: <Comparison /> },
{ path: "configuracoes", element: <Settings /> },
```
Manter `basename` consistente com o `base` do Vite: `/Treino-N/`.

- [ ] **Step 4: Compilar até zerar erros de import órfão**

Run: `npx tsc -b --noEmit`
Expected: corrigir referências restantes (ex.: `OnboardingGate` aponta pra `/corpo/onboarding` — ver Task 1.3). Repetir até PASS exceto o que a Task 1.3 trata.

### Task 1.3: Simplificar o OnboardingGate (sem onboarding de corpo)

**Files:**
- Modify: `src/components/OnboardingGate.tsx`
- Modify: `src/App.tsx` (mantém `startScheduler`)

- [ ] **Step 1: Substituir o gate por um "seed gate"** que só garante o seed e renderiza:

```tsx
import { type ReactNode, useEffect, useState } from "react";
import { seedDatabase } from "../lib/seed";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    seedDatabase().then(() => setReady(true));
  }, []);
  if (!ready) return <div className="p-8 text-center text-muted">Carregando…</div>;
  return <>{children}</>;
}
```

- [ ] **Step 2: Compilar**

Run: `npx tsc -b --noEmit`
Expected: PASS (ou só erros que a Task 1.4 do seed resolve).

### Task 1.4: Criar o seed da rotina (rotina-natalia-seed.ts)

**Files:**
- Create: `src/data/rotina-natalia-seed.ts`
- Modify: `src/lib/seed.ts`
- Test: `tests/data/rotina-natalia-seed.test.ts`

**Regras de mapeamento (JSON → `Exercise`), aplicar a CADA exercício de `treinos.A/B/C` em `rotina-natalia.json`:**
- `id`: slug kebab-case do `nome` (sem acento). Ex.: "Pendura na barra (dead hang)" → `pendura-na-barra`.
- `name` ← `nome`; `category` ← `musculo`; `steps` ← `passos`;
  `description` ← `passos` unidos por " "; `commonMistakes` ← `[cuidado]`;
  `proTips` ← `[dica]`; `easierVariation` ← `mais_facil`; `harderVariation` ← `mais_dificil`;
  `isSkill` ← `skill`; `isStar` ← `star`.
- `difficulty`: `skill === true` → `"intermediario"`, senão `"iniciante"`.
- `equipment`: inferir simples — se `nome`/`musculo` cita "halter" → `["halteres"]`; "barra"/"pendura"/"escápula" → `["barra"]`; "prancha"/"dead bug"/"parada de mão"/"flexão"/"ponte" → `["peso-corporal"]`; default `["peso-corporal"]`.
- `timeBasedSec`: se `reps` casar `/(\d+)\s*s/` (ex.: "3 × até 20s", "3 × 20-40s", "3 × 20-30s"), pegar o **primeiro** número → segundos-alvo do hold. Senão `undefined`.
- `startLoadKg`: deixar `undefined` (a rotina não fixa carga; a sugestão começa pela faixa de reps).
- `videoUrl`: para os **skills** (isSkill) preencher com URL de busca do YouTube:
  `https://www.youtube.com/results?search_query=` + nome do exercício + " tutorial".
- `gifPath`: `"/exercises/<id>.gif"` para exercícios comuns (não-skill) — o arquivo pode não existir ainda; o componente faz fallback (Task 2.4). Para skills, `gifPath` undefined (usam vídeo).

**Cardio e mobilidade** viram exercícios + templates próprios:
- Exercícios: `cardio-hiit` (timeBasedSec 30, equip `["corda"]`, do bloco `cardio.intervalo`), `mobilidade-geral` (de `mobilidade.blocos`).
- Templates (ver IDs abaixo).

**IDs de exercício esperados (Força):**
`pendura-na-barra, puxada-de-escapula, remada-com-1-braco, elevacao-lateral, abertura-invertida, rosca-de-biceps, prancha, agachamento-com-halter-no-peito, afundo-parado, levantamento-romeno, elevacao-de-quadril, panturrilha-em-pe, dead-bug, flexao-inclinada, parada-de-mao-na-parede, desenvolvimento-de-ombro, flexao-pike, triceps-com-halter, prancha-lateral`
(Obs.: "Elevação lateral" aparece em A e C — é o **mesmo** id `elevacao-lateral`, definido uma vez.)
Mais: `cardio-hiit, mobilidade-geral`.

**Templates esperados (`WORKOUT_PLAN`):**
| id | name | dayOfWeek | kind |
|----|------|-----------|------|
| `forca-a` | Força A · Puxar & Ombro | 1 | forca |
| `cardio-ter` | Cardio (HIIT na corda) | 2 | cardio |
| `forca-b` | Força B · Perna & Glúteo | 3 | forca |
| `mobilidade-qui` | Mobilidade | 4 | mobilidade |
| `forca-c` | Força C · Empurrar & Parada de Mão | 5 | forca |
| `cardio-sab` | Cardio leve (corda + caminhada) | 6 | cardio |

Cada `exercises[]` espelha os `exercicios` do treino correspondente: `sets` = primeiro número de `reps` antes do "×" (ex.: "3 × 12" → 3; "2 × 12" → 2); `repsTarget` = a parte após "×" (ex.: "12", "8-12", "até 20s", "10 / lado"); `restSec` = 75 (meio de 60-90). Cardio/mobilidade: 1 série do exercício único com `repsTarget` descritivo e `restSec` 0.

- [ ] **Step 1: Escrever o teste primeiro**

```ts
// tests/data/rotina-natalia-seed.test.ts
import { describe, it, expect } from "vitest";
import { EXERCISES, WORKOUT_PLAN } from "../../src/data/rotina-natalia-seed";

describe("rotina-natalia seed", () => {
  it("tem os 6 templates da semana nos dias certos", () => {
    const byDay = Object.fromEntries(WORKOUT_PLAN.map((t) => [t.dayOfWeek, t.id]));
    expect(byDay[1]).toBe("forca-a");
    expect(byDay[2]).toBe("cardio-ter");
    expect(byDay[3]).toBe("forca-b");
    expect(byDay[4]).toBe("mobilidade-qui");
    expect(byDay[5]).toBe("forca-c");
    expect(byDay[6]).toBe("cardio-sab");
    expect(WORKOUT_PLAN.find((t) => t.dayOfWeek === 0)).toBeUndefined(); // domingo folga
  });

  it("todo exerciseId referenciado existe em EXERCISES", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    for (const t of WORKOUT_PLAN) {
      for (const item of t.exercises) {
        expect(ids.has(item.exerciseId), `${t.id} → ${item.exerciseId}`).toBe(true);
      }
    }
  });

  it("marca exercícios por tempo com timeBasedSec", () => {
    const pendura = EXERCISES.find((e) => e.id === "pendura-na-barra")!;
    expect(pendura.timeBasedSec).toBe(20);
    const prancha = EXERCISES.find((e) => e.id === "prancha")!;
    expect(prancha.timeBasedSec).toBe(20);
  });

  it("skills têm videoUrl e não têm gifPath; comuns têm gifPath", () => {
    const skill = EXERCISES.find((e) => e.id === "parada-de-mao-na-parede")!;
    expect(skill.isSkill).toBe(true);
    expect(skill.videoUrl).toMatch(/youtube\.com/);
    const comum = EXERCISES.find((e) => e.id === "elevacao-lateral")!;
    expect(comum.gifPath).toBe("/exercises/elevacao-lateral.gif");
  });

  it("Força A tem 7 exercícios na ordem da rotina", () => {
    const a = WORKOUT_PLAN.find((t) => t.id === "forca-a")!;
    expect(a.exercises.map((e) => e.exerciseId)).toEqual([
      "pendura-na-barra", "puxada-de-escapula", "remada-com-1-braco",
      "elevacao-lateral", "abertura-invertida", "rosca-de-biceps", "prancha",
    ]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/data/rotina-natalia-seed.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Escrever `src/data/rotina-natalia-seed.ts`**

Transcrever os exercícios de `rotina-natalia.json` aplicando as regras acima. Exemplo de 2 exercícios (modelo a seguir para todos):

```ts
import type { Exercise, WorkoutTemplate } from "../lib/db";

export const EXERCISES: Exercise[] = [
  {
    id: "pendura-na-barra",
    name: "Pendura na barra (dead hang)",
    category: "Costas · pegada",
    equipment: ["barra"],
    difficulty: "intermediario",
    isSkill: true,
    isStar: false,
    timeBasedSec: 20,
    videoUrl: "https://www.youtube.com/results?search_query=dead+hang+pendura+na+barra+tutorial",
    steps: [
      "Segure a barra com as mãos na largura dos ombros, palmas pra frente.",
      "Tire os pés do chão e fique pendurada de braços esticados.",
      "Respire e segure o tempo que aguentar com a pegada firme.",
    ],
    description:
      "Segure a barra com as mãos na largura dos ombros, palmas pra frente. Tire os pés do chão e fique pendurada de braços esticados. Respire e segure o tempo que aguentar com a pegada firme.",
    proTips: ["Mantenha os ombros longe das orelhas, sem encolher o pescoço."],
    commonMistakes: ["Balançar o corpo — fique parada e controlada."],
    easierVariation: "Deixe os pés tocando o chão tirando parte do peso.",
    harderVariation: "Aumente o tempo de cada pendura.",
  },
  {
    id: "elevacao-lateral",
    name: "Elevação lateral",
    category: "Ombro (lateral)",
    equipment: ["halteres"],
    difficulty: "iniciante",
    isSkill: false,
    isStar: true,
    gifPath: "/exercises/elevacao-lateral.gif",
    steps: [
      "Em pé, um halter em cada mão ao lado do corpo, cotovelo levemente dobrado.",
      "Levante os braços pros lados até a altura dos ombros (forma um T).",
      "Desça devagar contando 2-3 segundos.",
    ],
    description:
      "Em pé, um halter em cada mão ao lado do corpo, cotovelo levemente dobrado. Levante os braços pros lados até a altura dos ombros (forma um T). Desça devagar contando 2-3 segundos.",
    proTips: ["Lidere com os cotovelos. É o exercício que faz a largura do ombro."],
    commonMistakes: ["Usar impulso e jogar os pesos pra cima."],
    easierVariation: "Pouco peso — não pede carga alta.",
    harderVariation: "Descida bem lenta (3-4s) ou mais reps.",
  },
  // … demais exercícios de A, B, C + cardio-hiit + mobilidade-geral
];

export const WORKOUT_PLAN: WorkoutTemplate[] = [
  {
    id: "forca-a",
    name: "Força A · Puxar & Ombro",
    dayOfWeek: 1,
    kind: "forca",
    durationMin: 45,
    exercises: [
      { exerciseId: "pendura-na-barra", sets: 3, repsTarget: "até 20s", restSec: 75 },
      { exerciseId: "puxada-de-escapula", sets: 3, repsTarget: "5", restSec: 75 },
      { exerciseId: "remada-com-1-braco", sets: 3, repsTarget: "10 / lado", restSec: 75 },
      { exerciseId: "elevacao-lateral", sets: 3, repsTarget: "12-15", restSec: 75 },
      { exerciseId: "abertura-invertida", sets: 3, repsTarget: "12-15", restSec: 75 },
      { exerciseId: "rosca-de-biceps", sets: 2, repsTarget: "12", restSec: 75 },
      { exerciseId: "prancha", sets: 3, repsTarget: "20-40s", restSec: 75 },
    ],
  },
  // … forca-b, cardio-ter, mobilidade-qui, forca-c, cardio-sab
];
```

- [ ] **Step 4: Rodar até passar**

Run: `npm test -- tests/data/rotina-natalia-seed.test.ts`
Expected: PASS.

- [ ] **Step 5: Reescrever `src/lib/seed.ts`** (semeia exercícios + templates do novo seed, com re-seed versionado):

```ts
import { db } from "./db";
import { EXERCISES } from "../data/rotina-natalia-seed";
import { WORKOUT_PLAN } from "../data/rotina-natalia-seed";

const SEED_VERSION = 1;

export async function seedDatabase(): Promise<void> {
  const v = await db.settings.get("seedVersion");
  if (((v?.value as number) ?? 0) >= SEED_VERSION) return;
  await db.transaction("rw", db.exercises, db.workoutTemplates, db.settings, async () => {
    for (const ex of EXERCISES) await db.exercises.put(ex);
    for (const tpl of WORKOUT_PLAN) await db.workoutTemplates.put(tpl);
    await db.settings.put({ key: "seedVersion", value: SEED_VERSION });
  });
}
```

- [ ] **Step 6: Suíte completa + commit**

Run: `npm test`
Expected: PASS (os testes restantes do app + o novo).
```powershell
git add -A; git commit -m "feat: modelo enxuto + seed da rotina da Natalia"
```

---

# Fase 2 — Telas (Hoje, Treinos, Exercício)

### Task 2.1: Mapeamento do dia (today-workout.ts)

**Files:**
- Create: `src/lib/today-workout.ts`
- Test: `tests/lib/today-workout.test.ts`

- [ ] **Step 1: Teste primeiro**

```ts
import { describe, it, expect } from "vitest";
import { describeDay } from "../../src/lib/today-workout";

describe("describeDay", () => {
  it("dia de folga (domingo)", () => {
    expect(describeDay(0)).toEqual({ kind: "folga", templateId: null, label: "Folga · descanso" });
  });
  it("dia de força mapeia o template", () => {
    expect(describeDay(1)).toEqual({ kind: "forca", templateId: "forca-a", label: "Força A · Puxar & Ombro" });
    expect(describeDay(3)).toEqual({ kind: "forca", templateId: "forca-b", label: "Força B · Perna & Glúteo" });
    expect(describeDay(5)).toEqual({ kind: "forca", templateId: "forca-c", label: "Força C · Empurrar & Parada de Mão" });
  });
  it("cardio e mobilidade", () => {
    expect(describeDay(2).kind).toBe("cardio");
    expect(describeDay(4).kind).toBe("mobilidade");
    expect(describeDay(6).kind).toBe("cardio");
  });
});
```

- [ ] **Step 2: Rodar e falhar**

Run: `npm test -- tests/lib/today-workout.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```ts
export interface DayInfo {
  kind: "forca" | "cardio" | "mobilidade" | "folga";
  templateId: string | null;
  label: string;
}

const MAP: Record<number, DayInfo> = {
  0: { kind: "folga", templateId: null, label: "Folga · descanso" },
  1: { kind: "forca", templateId: "forca-a", label: "Força A · Puxar & Ombro" },
  2: { kind: "cardio", templateId: "cardio-ter", label: "Cardio (HIIT na corda)" },
  3: { kind: "forca", templateId: "forca-b", label: "Força B · Perna & Glúteo" },
  4: { kind: "mobilidade", templateId: "mobilidade-qui", label: "Mobilidade" },
  5: { kind: "forca", templateId: "forca-c", label: "Força C · Empurrar & Parada de Mão" },
  6: { kind: "cardio", templateId: "cardio-sab", label: "Cardio leve (corda + caminhada)" },
};

export function describeDay(dayOfWeek: number): DayInfo {
  return MAP[dayOfWeek] ?? MAP[0];
}
```

- [ ] **Step 4: Passar + commit**

Run: `npm test -- tests/lib/today-workout.test.ts` → PASS
```powershell
git add -A; git commit -m "feat: mapeamento do treino do dia"
```

### Task 2.2: Tela "Hoje"

**Files:**
- Modify: `src/pages/Today.tsx`

Reescrever a `Today` enxuta usando `describeDay` e `TodayCard`.

- [ ] **Step 1: Reescrever `Today.tsx`**

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../lib/db";
import { describeDay } from "../lib/today-workout";
import { TodayCard } from "../components/TodayCard";

export function Today() {
  const day = describeDay(new Date().getDay());
  const template = useLiveQuery(
    () => (day.templateId ? db.workoutTemplates.get(day.templateId) : undefined),
    [day.templateId],
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-serif">Hoje</h1>
      <TodayCard title={day.label} variant="highlight" />

      {day.kind === "forca" && template && (
        <TodayCard
          title="Começar treino"
          subtitle={`${template.exercises.length} exercícios · ~${template.durationMin} min`}
          to={`/treino/sessao/${template.id}`}
          rightSlot={<span className="text-nude">▶</span>}
        />
      )}
      {day.kind === "cardio" && (
        <TodayCard title="Cardio do dia" subtitle="2 min aquecer → 30s pula / 30s alivia × 10-12 → 2 min soltar" to={`/treino/sessao/${day.templateId}`} />
      )}
      {day.kind === "mobilidade" && (
        <TodayCard title="Mobilidade (15-20 min)" subtitle="Ombro · costas · quadril · tornozelo" to={`/treino/sessao/${day.templateId}`} />
      )}
      {day.kind === "folga" && (
        <p className="text-muted">Descanso é parte do treino. Volte amanhã 💪</p>
      )}

      <div className="flex gap-3 pt-2">
        <Link className="text-nude underline" to="/treino/plano">Plano da semana</Link>
        <Link className="text-nude underline" to="/treino/progressao">Progresso</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Compilar + dev**

Run: `npx tsc -b --noEmit` → PASS
Run: `npm run dev` → abrir e ver "Hoje" com o treino do dia. Ctrl+C.

- [ ] **Step 3: Commit**

```powershell
git add -A; git commit -m "feat: tela Hoje com o treino do dia"
```

### Task 2.3: Ajustar WeeklyPlan e WorkoutHome (sem ciclos)

**Files:**
- Modify: `src/pages/workout/WeeklyPlan.tsx`
- Modify: `src/pages/workout/WorkoutHome.tsx`

- [ ] **Step 1: `WeeklyPlan`** — listar `db.workoutTemplates.orderBy("dayOfWeek").toArray()` sem filtro de ciclo; rótulo do dia (Dom..Sáb) e destaque do dia atual. Remover `useSetting("activeCycle")`.

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function WeeklyPlan() {
  const templates = useLiveQuery(() => db.workoutTemplates.orderBy("dayOfWeek").toArray(), []);
  const today = new Date().getDay();
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-2xl font-serif">Plano da semana</h1>
      {templates?.map((t) => (
        <Link key={t.id} to={`/treino/sessao/${t.id}`}
          className={`card block ${t.dayOfWeek === today ? "border-nude" : ""}`}>
          <div className="text-label text-muted">{DIAS[t.dayOfWeek]}</div>
          <div className="font-medium">{t.name}</div>
          <div className="text-sm text-muted">{t.exercises.length} exercícios</div>
        </Link>
      ))}
      <div className="card opacity-60">
        <div className="text-label text-muted">Dom</div>
        <div className="font-medium">Folga · descanso</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `WorkoutHome`** — manter só 3 cards: Plano semanal (`/treino/plano`), Biblioteca (`/treino/biblioteca`), Progressão (`/treino/progressao`). Remover cards de Movimento e Ciclos.

- [ ] **Step 3: Compilar + commit**

Run: `npx tsc -b --noEmit` → PASS
```powershell
git add -A; git commit -m "feat: plano semanal e hub de treino enxutos"
```

### Task 2.4: Renderizar GIF + vídeo no exercício

**Files:**
- Modify: `src/pages/workout/ExerciseDetail.tsx`
- Modify: `src/components/ExerciseInfoModal.tsx`
- Create: `public/exercises/.gitkeep` (pasta dos GIFs)

- [ ] **Step 1: Bloco de mídia reutilizável** — em ambos os componentes, antes do conteúdo textual, renderizar:

```tsx
{exercise.gifPath && (
  <img
    src={exercise.gifPath}
    alt={`Demonstração: ${exercise.name}`}
    className="w-full rounded-card mb-3"
    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
  />
)}
{exercise.videoUrl && (
  <a href={exercise.videoUrl} target="_blank" rel="noreferrer"
     className="inline-block mb-3 text-nude underline">▶ Ver vídeo do exercício</a>
)}
```
(O `onError` esconde a imagem se o GIF ainda não existir — fallback gracioso, app continua offline.)

- [ ] **Step 2: Renderizar passos numerados** — onde hoje mostra `description`, preferir `steps` quando existir:

```tsx
{exercise.steps?.length ? (
  <ol className="list-decimal pl-5 space-y-1">
    {exercise.steps.map((s, i) => <li key={i}>{s}</li>)}
  </ol>
) : <p>{exercise.description}</p>}
```

- [ ] **Step 3: Criar a pasta de GIFs**

```powershell
New-Item -ItemType Directory -Force "C:\Users\ASCalderon\Desktop\Treino-N\public\exercises" | Out-Null
New-Item -ItemType File -Force "C:\Users\ASCalderon\Desktop\Treino-N\public\exercises\.gitkeep" | Out-Null
```

- [ ] **Step 4: Smoke test do detalhe do exercício**

```tsx
// tests/pages/exercise-detail.smoke.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { db } from "../../src/lib/db";
import { ExerciseDetail } from "../../src/pages/workout/ExerciseDetail";

it("mostra nome, passos e link de vídeo de um skill", async () => {
  await db.exercises.put({
    id: "parada-de-mao-na-parede", name: "Parada de mão na parede (segurar)",
    category: "Ombro · core", equipment: ["peso-corporal"], difficulty: "intermediario",
    isSkill: true, timeBasedSec: 30, videoUrl: "https://www.youtube.com/results?search_query=x",
    steps: ["De frente pra parede…"], description: "De frente pra parede…", commonMistakes: [],
  });
  const router = createMemoryRouter(
    [{ path: "/treino/exercicio/:id", element: <ExerciseDetail /> }],
    { initialEntries: ["/treino/exercicio/parada-de-mao-na-parede"] },
  );
  render(<RouterProvider router={router} />);
  expect(await screen.findByText(/Parada de mão na parede/)).toBeInTheDocument();
  expect(await screen.findByText(/Ver vídeo/)).toBeInTheDocument();
});
```

- [ ] **Step 5: Rodar + commit**

Run: `npm test -- tests/pages/exercise-detail.smoke.test.tsx` → PASS
```powershell
git add -A; git commit -m "feat: GIF + video + passos numerados no exercicio"
```

---

# Fase 3 — Treino ativo: cronômetro e sugestão de peso

### Task 3.1: Componente HoldTimer (cronômetro de "segurar")

**Files:**
- Create: `src/components/HoldTimer.tsx`
- Test: `tests/components/hold-timer.test.tsx`

Cronômetro **progressivo** (conta o tempo segurado) com alvo opcional; vibra ao atingir o alvo. Baseado no padrão de timer de `MoveStep`.

- [ ] **Step 1: Teste primeiro**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { HoldTimer } from "../../src/components/HoldTimer";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("conta o tempo e marca o alvo atingido", async () => {
  render(<HoldTimer targetSec={3} />);
  // inicia
  screen.getByRole("button", { name: /iniciar/i }).click();
  act(() => { vi.advanceTimersByTime(3000); });
  expect(screen.getByText(/0:03/)).toBeInTheDocument();
  expect(screen.getByText(/alvo/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar e falhar**

Run: `npm test -- tests/components/hold-timer.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```tsx
import { useEffect, useRef, useState } from "react";

interface Props { targetSec?: number; onStop?: (elapsedSec: number) => void; }

function fmt(s: number) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }

export function HoldTimer({ targetSec, onStop }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const buzzed = useRef(false);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => { if (ref.current) clearInterval(ref.current); };
    }
  }, [running]);

  useEffect(() => {
    if (targetSec && elapsed >= targetSec && !buzzed.current) {
      buzzed.current = true;
      if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
    }
  }, [elapsed, targetSec]);

  const reached = targetSec ? elapsed >= targetSec : false;

  return (
    <div className="card text-center space-y-2">
      <div className="text-3xl tabular-nums">{fmt(elapsed)}</div>
      {targetSec && <div className="text-xs text-muted">alvo {fmt(targetSec)}{reached ? " · alvo atingido ✅" : ""}</div>}
      <div className="flex gap-2 justify-center">
        {!running ? (
          <button className="px-3 py-1 rounded-pill bg-wine-light" onClick={() => setRunning(true)}>Iniciar</button>
        ) : (
          <button className="px-3 py-1 rounded-pill bg-wine-light" onClick={() => setRunning(false)}>Pausar</button>
        )}
        <button className="px-3 py-1 rounded-pill bg-bg-deep"
          onClick={() => { setRunning(false); onStop?.(elapsed); setElapsed(0); buzzed.current = false; }}>
          Zerar
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Passar + commit**

Run: `npm test -- tests/components/hold-timer.test.tsx` → PASS
```powershell
git add -A; git commit -m "feat: cronometro de segurar (HoldTimer)"
```

### Task 3.2: Integrar hold/skill no SessionRecorder

**Files:**
- Modify: `src/components/SessionRecorder.tsx`

`SessionRecorder` hoje grava peso×reps e tem timer de descanso + sugestão. Adaptar:

- [ ] **Step 1: Exercício por tempo** — quando `exercise.timeBasedSec` estiver definido, renderizar `<HoldTimer targetSec={exercise.timeBasedSec} />` no topo e, nas linhas de série, esconder o campo **peso** (deixar só reps/tempo + "feito"). Importar `HoldTimer`.

- [ ] **Step 2: Skill sem carga** — quando `exercise.isSkill`, esconder a sugestão de peso e o campo peso; em vez da sugestão de carga, mostrar a dica de progressão a partir de `exercise.harderVariation`:
```tsx
{exercise.isSkill && exercise.harderVariation && (
  <p className="text-sm text-muted">Progresso: {exercise.harderVariation}</p>
)}
```

- [ ] **Step 3: Sugestão de peso só pra quem tem carga** — manter o bloco de `suggestNextLoad` apenas quando `!exercise.isSkill && !exercise.timeBasedSec`. (A lógica de `suggestNextLoad` já existe em `src/lib/progression.ts`; nada a reimplementar.)

- [ ] **Step 4: Compilar + dev (verificação manual)**

Run: `npx tsc -b --noEmit` → PASS
Run: `npm run dev` → abrir uma sessão de Força A: a pendura mostra HoldTimer; a elevação lateral mostra sugestão de peso. Ctrl+C.

- [ ] **Step 5: Commit**

```powershell
git add -A; git commit -m "feat: SessionRecorder suporta hold e skills sem carga"
```

### Task 3.3: Garantir que SessionDetail funciona com os novos templates

**Files:**
- Modify (se necessário): `src/pages/workout/SessionDetail.tsx`

`SessionDetail` lê `db.workoutTemplates.get(templateId)` e renderiza um `SessionRecorder` por exercício, salvando uma `WorkoutSession`. Como o shape de `WorkoutTemplate.exercises[]` (exerciseId/sets/repsTarget/restSec) foi mantido, deve funcionar.

- [ ] **Step 1: Smoke test de sessão**

```tsx
// tests/pages/session-detail.smoke.test.tsx — adaptar do tests/pages/workout-session.smoke.test.tsx existente
```
Garantir que abre o template `forca-a`, mostra os exercícios e permite salvar.

- [ ] **Step 2: Rodar + ajustar o que quebrar + commit**

Run: `npm test -- tests/pages/session-detail.smoke.test.tsx` → PASS
```powershell
git add -A; git commit -m "test: sessao de treino com a rotina nova"
```

---

# Fase 4 — Notificações

### Task 4.1: Cálculo de deload

**Files:**
- Create: `src/lib/deload.ts`
- Test: `tests/lib/deload.test.ts`

Regra da rotina: a cada ~6-8 semanas, 1 semana mais leve. Notificar quando a semana corrente desde o início (ou último deload) atingir 6.

- [ ] **Step 1: Teste**

```ts
import { describe, it, expect } from "vitest";
import { weeksBetween, isDeloadDue } from "../../src/lib/deload";

describe("deload", () => {
  it("conta semanas inteiras entre datas", () => {
    expect(weeksBetween("2026-01-01", "2026-01-01")).toBe(0);
    expect(weeksBetween("2026-01-01", "2026-01-15")).toBe(2);
  });
  it("deload vence a partir de 6 semanas e ainda não notificado nesse ciclo", () => {
    expect(isDeloadDue({ startISO: "2026-01-01", todayISO: "2026-02-12", lastDeloadNotifyISO: "" })).toBe(true); // 6 sem
    expect(isDeloadDue({ startISO: "2026-01-01", todayISO: "2026-01-29", lastDeloadNotifyISO: "" })).toBe(false); // 4 sem
    expect(isDeloadDue({ startISO: "2026-01-01", todayISO: "2026-02-12", lastDeloadNotifyISO: "2026-02-10" })).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e falhar**

Run: `npm test -- tests/lib/deload.test.ts` → FAIL.

- [ ] **Step 3: Implementar**

```ts
const DAY = 86_400_000;

export function weeksBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00").getTime();
  const to = new Date(toISO + "T00:00:00").getTime();
  return Math.floor((to - from) / (7 * DAY));
}

export function isDeloadDue(opts: { startISO: string; todayISO: string; lastDeloadNotifyISO: string }): boolean {
  if (!opts.startISO) return false;
  const weeks = weeksBetween(opts.startISO, opts.todayISO);
  if (weeks < 6) return false;
  // não notificar de novo se já avisou nas últimas 2 semanas
  if (opts.lastDeloadNotifyISO && weeksBetween(opts.lastDeloadNotifyISO, opts.todayISO) < 2) return false;
  return true;
}
```

- [ ] **Step 4: Passar + commit**

Run: `npm test -- tests/lib/deload.test.ts` → PASS
```powershell
git add -A; git commit -m "feat: calculo de semana de deload"
```

### Task 4.2: Enxugar settings e reorientar o scheduler

**Files:**
- Modify: `src/lib/settings-helpers.ts` e `src/hooks/useSetting.ts` (mesmo `Settings` + `DEFAULTS`)
- Modify: `src/lib/notification-scheduler.ts`
- Test: `tests/lib/notification-scheduler.test.ts`

- [ ] **Step 1: `Settings` enxuto** (em settings-helpers.ts e o DEFAULTS duplicado em useSetting.ts):

```ts
export interface Settings {
  seedVersion: number;
  notificationsEnabled: boolean;          // default true
  workoutReminderTime: string;            // "HH:MM", default "08:00"
  quietHours: { from: string; to: string }; // default { from: "22:00", to: "07:00" }
  focusModeUntil: number | null;          // default null
  lastWorkoutReminderAt: string;          // "yyyy-mm-dd", default ""
  programStartISO: string;                // início do programa, default ""
  lastDeloadNotifyAt: string;             // "yyyy-mm-dd", default ""
}

export const DEFAULTS: Settings = {
  seedVersion: 0,
  notificationsEnabled: true,
  workoutReminderTime: "08:00",
  quietHours: { from: "22:00", to: "07:00" },
  focusModeUntil: null,
  lastWorkoutReminderAt: "",
  programStartISO: "",
  lastDeloadNotifyAt: "",
};
```
Manter as funções `getSetting`/`setSetting` (genéricas) como estão.

- [ ] **Step 2: Reescrever `notification-scheduler.ts`** (só lembrete diário do treino + deload; descanso é disparado pelo timer, não aqui):

```ts
import { db } from "./db";
import { shouldNotifyNow, notify, shouldRemindOncePerDay } from "./notifications";
import { getSetting, setSetting } from "./settings-helpers";
import { describeDay } from "./today-workout";
import { isDeloadDue } from "./deload";

let intervalId: ReturnType<typeof setInterval> | null = null;

export async function tick(now = new Date()): Promise<void> {
  const settings = {
    notificationsEnabled: await getSetting("notificationsEnabled"),
    focusModeUntil: await getSetting("focusModeUntil"),
    quietHours: await getSetting("quietHours"),
  };
  if (!shouldNotifyNow(now, settings)) return;

  const todayISO = now.toISOString().slice(0, 10);
  const currentMin = now.getHours() * 60 + now.getMinutes();

  // 1) Lembrete diário do treino do dia
  const [h, m] = (await getSetting("workoutReminderTime")).split(":").map(Number);
  const last = await getSetting("lastWorkoutReminderAt");
  const day = describeDay(now.getDay());
  if (shouldRemindOncePerDay({ currentMin, targetMin: h * 60 + m, lastNotifiedDate: last, todayISO, done: day.kind === "folga" })) {
    notify("Treino de hoje", day.kind === "folga" ? "Dia de descanso 💆" : `Hoje é ${day.label}`);
    await setSetting("lastWorkoutReminderAt", todayISO);
  }

  // 2) Deload (a cada ~6-8 semanas)
  const startISO = await getSetting("programStartISO");
  const lastDeload = await getSetting("lastDeloadNotifyAt");
  if (isDeloadDue({ startISO, todayISO, lastDeloadNotifyISO: lastDeload })) {
    notify("Semana de deload", "Já são ~6 semanas. Faça uma semana mais leve pra recuperar.");
    await setSetting("lastDeloadNotifyAt", todayISO);
  }
}

export function startScheduler() {
  if (intervalId !== null) return;
  // grava o início do programa na 1ª vez
  void (async () => {
    if (!(await getSetting("programStartISO"))) {
      await setSetting("programStartISO", new Date().toISOString().slice(0, 10));
    }
  })();
  intervalId = setInterval(() => void tick(), 60_000);
}

export function stopScheduler() {
  if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
}
```

- [ ] **Step 3: Teste do scheduler** (substitui o antigo `notifications.test.ts`/`settings-reminders`):

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { db } from "../../src/lib/db";
import { setSetting } from "../../src/lib/settings-helpers";
import { tick } from "../../src/lib/notification-scheduler";

beforeEach(async () => { await db.settings.clear(); });

it("notifica o treino do dia uma vez, no horário", async () => {
  const spy = vi.fn();
  vi.stubGlobal("Notification", class { static permission = "granted"; constructor() { spy(); } });
  await setSetting("notificationsEnabled", true);
  await setSetting("workoutReminderTime", "08:00");
  // segunda-feira 08:30
  const monday0830 = new Date("2026-06-08T08:30:00");
  await tick(monday0830);
  await tick(monday0830); // segundo tick no mesmo dia não repete
  expect(spy).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 4: Rodar até passar**

Run: `npm test -- tests/lib/notification-scheduler.test.ts`
Expected: PASS (ajustar `notify`/`shouldNotifyNow` se necessário — `isWithinWorkingHours` não é mais usado; pode remover de `notifications.ts`).

- [ ] **Step 5: Suíte completa + commit**

Run: `npm test` → PASS
```powershell
git add -A; git commit -m "feat: notificacoes de treino diario e deload"
```

### Task 4.3: Tela de Ajustes enxuta

**Files:**
- Modify: `src/pages/Settings.tsx`

- [ ] **Step 1: Manter só** — toggle `notificationsEnabled` (com `requestNotificationPermission`), input `workoutReminderTime`, `quietHours` (from/to), modo foco (30min/2h/8h), backup export/import, e "Apagar tudo". Remover todos os inputs de transição (skincare/hidratação/postura/caminhada/intervalos).

- [ ] **Step 2: Compilar + dev (verificação manual)**

Run: `npx tsc -b --noEmit` → PASS
Run: `npm run dev` → Ajustes mostra só treino/notificação/backup. Ctrl+C.

- [ ] **Step 3: Commit**

```powershell
git add -A; git commit -m "feat: ajustes enxutos (notificacoes de treino + backup)"
```

---

# Fase 5 — Tema roxo/azul, navegação e finalização

### Task 5.1: Paleta roxo/azul

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/index.css` (se houver cor hardcoded)

- [ ] **Step 1: Trocar as cores** em `tailwind.config.ts` (mantendo os mesmos nomes de token `wine`/`nude`/`muted`/`bg.*` pra não reescrever todas as classes do app):

```ts
colors: {
  bg: {
    base: "#1e1b4b",    // índigo bem escuro (fundo)
    raised: "#2a2566",  // card
    deep: "#161232",    // inputs/botões
    border: "#3b357a",  // borda
  },
  wine: {               // "acento primário" → agora roxo
    DEFAULT: "#7c3aed",
    light: "#a78bfa",
  },
  nude: {               // "acento secundário/texto" → azul claro
    DEFAULT: "#60a5fa",
    light: "#93c5fd",
    warm: "#e0e7ff",    // texto principal (lavanda clara)
  },
  muted: "#9c9ad6",     // texto secundário
},
```
(Os nomes `wine`/`nude` ficam, mas as cores são roxo/azul. Opcional renomear depois.)

- [ ] **Step 2: Conferir visual**

Run: `npm run dev` → app em roxo/azul; sem texto ilegível. Ajustar tons se necessário. Ctrl+C.

- [ ] **Step 3: Commit**

```powershell
git add -A; git commit -m "style: tema roxo e azul"
```

### Task 5.2: Bottom nav final (4 abas)

**Files:**
- Modify: `src/components/BottomNav.tsx`
- (Opcional) `src/icons/*` — reutilizar os ícones existentes.

- [ ] **Step 1: 4 abas** — Hoje (`/`, HomeIcon, end), Treinos (`/treino`, DumbbellIcon), Progresso (`/treino/progressao`, RulerIcon), Ajustes (`/configuracoes`, HeartIcon ou um ícone de engrenagem). Remover Beleza e Trilha.

```tsx
import { NavLink } from "react-router-dom";
import { HomeIcon } from "../icons/HomeIcon";
import { DumbbellIcon } from "../icons/DumbbellIcon";
import { RulerIcon } from "../icons/RulerIcon";
import { HeartIcon } from "../icons/HeartIcon";

const ITEMS = [
  { to: "/", label: "Hoje", Icon: HomeIcon, end: true },
  { to: "/treino", label: "Treinos", Icon: DumbbellIcon, end: false },
  { to: "/treino/progressao", label: "Progresso", Icon: RulerIcon, end: false },
  { to: "/configuracoes", label: "Ajustes", Icon: HeartIcon, end: false },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 flex justify-around bg-bg-raised border-t border-bg-border">
      {ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) => `flex flex-col items-center py-2 text-xs ${isActive ? "text-nude" : "text-muted"}`}>
          <Icon /><span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Compilar + dev** → 4 abas navegam. Ctrl+C.

- [ ] **Step 3: Commit**

```powershell
git add -A; git commit -m "feat: navegacao com 4 abas"
```

### Task 5.3: Limpeza final e verificação

**Files:** vários (remoção de mortos).

- [ ] **Step 1: Caça a imports/arquivos órfãos**

Run: `npx tsc -b --noEmit`
Expected: PASS sem warnings de não-usado relevantes. Remover componentes/ícones que ninguém mais importa.

- [ ] **Step 2: Suíte completa verde**

Run: `npm test`
Expected: PASS em todos os arquivos.

- [ ] **Step 3: Build de produção**

Run: `npm run build`
Expected: `tsc -b` + `vite build` sem erros; gera `dist/` com o service worker do PWA.

- [ ] **Step 4: Preview e checagem de PWA**

Run: `npm run preview`
Expected: abre o build; no DevTools → Application, o manifest mostra "Treino da Natália" e cores roxo/azul; instalável. Ctrl+C.

- [ ] **Step 5: Commit final**

```powershell
git add -A; git commit -m "chore: limpeza final e build verde"
```

### Task 5.4: (Opcional) Adicionar GIFs reais

**Files:**
- Add: `public/exercises/<id>.gif` para os exercícios comuns.

- [ ] **Step 1:** Para cada `gifPath` referenciado, colocar um GIF curto (de banco livre, ex.: gifs de exercícios de domínio público / criados). Nome = `<id>.gif`. Sem o arquivo, o `onError` (Task 2.4) esconde a imagem — então isso é incremental e não bloqueia.
- [ ] **Step 2:** `git add public/exercises; git commit -m "assets: gifs dos exercicios"`.

---

## Próximas etapas (fora deste plano)

- **Deploy** (GitHub Pages, igual ao Treino-TF: workflow `.github/workflows/deploy.yml` ajustando `base`/repo) pra ela instalar no celular pela URL.
- **2ª etapa do produto:** tela de skills roadmap (barra → flexão → parada de mão) a partir de `roadmap_skills`; lembrete de foto a cada 4 semanas.

---

## Self-review (cobertura da spec)

- PWA instalável/offline → Fase 0 (base) + 5.3/5.4 (build/preview/manifest). ✅
- Estrutura semanal A/B/C/cardio/mobilidade/folga → Task 1.4 + 2.1 + 2.2 + 2.3. ✅
- Tela do exercício (passos/dica/cuidado/variações + GIF/vídeo misto) → Task 1.4 (dados) + 2.4 (render). ✅
- Cronômetro descanso → já existe no `SessionRecorder`; cronômetro "segurar" → Task 3.1 + 3.2. ✅
- Sugestão de peso (progressão dupla) → `suggestNextLoad` existente, ligado em 3.2; skills sem carga tratados. ✅
- Notificações: diário do treino + fim do descanso (timer) + deload → Task 4.1 + 4.2 (diário/deload), descanso via `SessionRecorder`/`HoldTimer`. ✅
- Tema roxo/azul → Task 5.1. ✅
- Progresso (cargas + medidas/fotos) → `ProgressionHistory`/`Measurements`/`Photos` mantidos; nav em 5.2. ✅
- Remoção da transição → Task 1.2. ✅
- Node como pré-requisito → Task 0.1. ✅
- Skills roadmap fora da 1ª versão → "Próximas etapas". ✅

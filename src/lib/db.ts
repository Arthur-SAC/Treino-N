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

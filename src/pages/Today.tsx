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

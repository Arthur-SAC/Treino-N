import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { db } from "../lib/db";
import { describeDay } from "../lib/today-workout";
import { TodayCard } from "../components/TodayCard";

// Vermelho/carmesim do programa Triângulo Invertido (sobrescreve o --glow ciano).
const TRI_GLOW = "239, 68, 68";
const triStyle = { "--glow": TRI_GLOW } as CSSProperties;

export function Today() {
  const dow = new Date().getDay();
  const day = describeDay(dow);

  // Nos dias de força existem dois treinos (formato X e triângulo invertido).
  const forcaTemplates = useLiveQuery(
    () => db.workoutTemplates.where("dayOfWeek").equals(dow).toArray(),
    [dow],
  );

  return (
    <div className="p-4 pb-24 space-y-4">
      <h1 className="text-2xl font-serif">Hoje</h1>
      <TodayCard title={day.label} variant="highlight" />

      {day.kind === "forca" && forcaTemplates && (
        <>
          <p className="text-muted text-sm">Escolha o treino de hoje:</p>
          {forcaTemplates
            .filter((t) => t.kind === "forca")
            .slice()
            .sort((a, b) => (a.program === "tri" ? 1 : 0) - (b.program === "tri" ? 1 : 0)) // formato X primeiro
            .map((t) => {
              const isTri = t.program === "tri";
              return (
                <div key={t.id} style={isTri ? triStyle : undefined}>
                  <TodayCard
                    title={t.name}
                    subtitle={`${isTri ? "Triângulo invertido" : "Formato X"} · ${t.exercises.length} exercícios · ~${t.durationMin} min`}
                    to={`/treino/sessao/${t.id}`}
                    rightSlot={<span className="text-nude">▶</span>}
                  />
                </div>
              );
            })}
        </>
      )}
      {day.kind === "cardio" && day.templateId && (
        <TodayCard title="Cardio do dia" subtitle="2 min aquecer → 30s pula / 30s alivia × 10-12 → 2 min soltar" to={`/treino/sessao/${day.templateId}`} />
      )}
      {day.kind === "mobilidade" && day.templateId && (
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

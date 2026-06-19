import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { db, type WorkoutTemplate } from "../../lib/db";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const triStyle = { "--glow": "239, 68, 68" } as CSSProperties;

export function WeeklyPlan() {
  const templates = useLiveQuery(() => db.workoutTemplates.orderBy("dayOfWeek").toArray(), []);
  const today = new Date().getDay();

  const card = (t: WorkoutTemplate) => (
    <Link
      key={t.id}
      to={`/treino/sessao/${t.id}`}
      className={`card block ${t.dayOfWeek === today ? "border-nude" : ""}`}
    >
      <div className="text-label text-muted">{DIAS[t.dayOfWeek]}</div>
      <div className="font-medium">{t.name}</div>
      <div className="text-sm text-muted">{t.exercises.length} exercícios</div>
    </Link>
  );

  const x = templates?.filter((t) => t.program === "x") ?? [];
  const tri = templates?.filter((t) => t.program === "tri") ?? [];

  return (
    <div className="p-4 pb-24 space-y-3">
      <h1 className="text-2xl font-serif">Plano da semana</h1>

      <span className="sys-label block pt-1">[ Formato X · ombro largo + cintura fina ]</span>
      {x.map(card)}

      <div style={triStyle} className="space-y-3">
        <span className="sys-label block pt-3">[ Triângulo invertido · shape em V ]</span>
        {tri.map(card)}
      </div>

      <div className={`card opacity-60 ${today === 0 ? "border-nude" : ""}`}>
        <div className="text-label text-muted">Dom</div>
        <div className="font-medium">Folga · descanso</div>
      </div>
    </div>
  );
}

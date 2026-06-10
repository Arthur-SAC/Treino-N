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

import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { db, type Exercise, type WorkoutSession } from "../../lib/db";
import { SessionRecorder } from "../../components/SessionRecorder";
import { CelebrationCard } from "../../components/CelebrationCard";
import { pickCelebration } from "../../data/celebration-phrases";
import { WARMUP_BLOCKS } from "../../data/rotina-natalia-seed";

// Vermelho/carmesim do programa Triângulo Invertido (sobrescreve o --glow ciano).
const triStyle = { "--glow": "239, 68, 68" } as CSSProperties;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SessionDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = useLiveQuery(
    async () => (templateId ? await db.workoutTemplates.get(templateId) : undefined),
    [templateId],
  );
  const exercises = useLiveQuery(async () => {
    if (!template) return [];
    const ids = template.exercises.map((e) => e.exerciseId);
    return db.exercises.where("id").anyOf(ids).toArray();
  }, [template]);

  const [recorded, setRecorded] = useState<WorkoutSession["exercises"]>([]);
  const [feedback, setFeedback] = useState<WorkoutSession["difficultySelf"]>("medium");
  const [celebration, setCelebration] = useState<string | null>(null);
  const [warmupOpen, setWarmupOpen] = useState(false);
  // Serializa as escritas pra evitar criar dois rascunhos da mesma sessão.
  const writeChain = useRef<Promise<unknown>>(Promise.resolve());

  // Continua de onde parou: carrega o rascunho da sessão de hoje deste treino.
  useEffect(() => {
    if (!template) return;
    let mounted = true;
    db.workoutSessions
      .where("date")
      .equals(todayISO())
      .toArray()
      .then((rows) => {
        if (!mounted) return;
        const existing = rows.find((r) => r.templateId === template.id);
        if (existing) {
          setRecorded(existing.exercises);
          if (existing.difficultySelf) setFeedback(existing.difficultySelf);
        }
      });
    return () => {
      mounted = false;
    };
  }, [template?.id]);

  if (!template || !exercises) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  const isTri = template.program === "tri";
  const exMap = new Map<string, Exercise>(exercises.map((e) => [e.id, e]));

  // Persiste o rascunho da sessão imediatamente (peso/reps não se perdem se fechar o app).
  // Faz upsert por (data de hoje + templateId), serializado pela writeChain.
  async function doPersist(exs: WorkoutSession["exercises"], fb: WorkoutSession["difficultySelf"]) {
    if (!template) return;
    const data = {
      date: todayISO(),
      templateId: template.id,
      exercises: exs,
      durationMin: template.durationMin,
      difficultySelf: fb,
    };
    const rows = await db.workoutSessions.where("date").equals(todayISO()).toArray();
    const existing = rows.find((r) => r.templateId === template.id);
    if (existing && existing.id != null) {
      await db.workoutSessions.update(existing.id, data);
    } else {
      await db.workoutSessions.add(data as WorkoutSession);
    }
  }

  function persist(exs: WorkoutSession["exercises"], fb: WorkoutSession["difficultySelf"]) {
    const p = writeChain.current.then(() => doPersist(exs, fb));
    writeChain.current = p.catch(() => {});
    return p;
  }

  function handleExerciseSave(entry: WorkoutSession["exercises"][number]) {
    const next = [...recorded.filter((r) => r.exerciseId !== entry.exerciseId), entry];
    setRecorded(next);
    void persist(next, feedback);
  }

  async function finishSession() {
    await persist(recorded, feedback);
    setCelebration(pickCelebration());
  }

  return (
    <div className="p-4 pb-24" style={isTri ? triStyle : undefined}>
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino/plano" className="text-muted text-sm">&larr; Plano</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">{template.name}</h1>
      </div>

      {/* Objetivo do dia */}
      {template.focus && (
        <div className="card mb-3">
          <span className="sys-label block mb-1">[ Objetivo de hoje ]</span>
          <p className="text-sm text-nude-warm/90">{template.focus}</p>
        </div>
      )}

      {/* Aquecimento (só treinos de força) */}
      {template.kind === "forca" && (
        <div className="card mb-3">
          <button
            type="button"
            onClick={() => setWarmupOpen((o) => !o)}
            className="w-full flex items-center justify-between text-left"
          >
            <span>
              <span className="sys-label block mb-1">[ Antes de começar ]</span>
              <span className="text-nude-warm font-medium">Aquecimento · ~5 min</span>
            </span>
            <span className="text-muted text-lg">{warmupOpen ? "−" : "+"}</span>
          </button>
          {warmupOpen && (
            <div className="mt-3 space-y-3">
              {WARMUP_BLOCKS.map((block, i) => (
                <div key={i}>
                  <p className="text-nude-warm text-sm font-medium">
                    {block.titulo}
                    {block.duracao && <span className="text-muted font-normal"> · {block.duracao}</span>}
                  </p>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-sm text-nude-warm/85">
                    {block.passos.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-xs text-nude/90">✓ Mais resultado: {block.resultado}</p>
                  <p className="text-xs text-muted">⚠ Sinal de erro: {block.erro}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {template.exercises.map((tplEx, i) => {
        const ex = exMap.get(tplEx.exerciseId);
        if (!ex) return null;
        const alreadyRecorded = recorded.some((r) => r.exerciseId === ex.id);
        if (alreadyRecorded) {
          return (
            <div key={i} className="card mb-3 border-nude">
              <h3 className="text-nude-warm font-medium">{ex.name} ✓</h3>
              <p className="text-muted text-xs">Registrado</p>
            </div>
          );
        }
        return (
          <SessionRecorder
            key={i}
            exercise={ex}
            setsTarget={tplEx.sets}
            repsTarget={tplEx.repsTarget}
            restSec={tplEx.restSec}
            onSave={handleExerciseSave}
          />
        );
      })}

      <div className="card">
        <h2 className="text-nude-warm font-medium mb-2">Como foi o treino?</h2>
        <div className="flex gap-2 mb-3">
          {(["easy", "medium", "hard"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFeedback(f)}
              className={`flex-1 py-2 rounded-md text-sm ${
                feedback === f ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {f === "easy" ? "Fácil" : f === "medium" ? "Médio" : "Difícil"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={finishSession}
          disabled={recorded.length === 0}
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium disabled:opacity-50"
        >
          Finalizar treino ({recorded.length} exercícios)
        </button>
      </div>

      {celebration && (
        <CelebrationCard
          phrase={celebration}
          onClose={() => navigate("/treino", { replace: true })}
        />
      )}
    </div>
  );
}

import { useEffect } from "react";
import type { Exercise } from "../lib/db";
import { ExerciseMediaBlock } from "./ExerciseMediaBlock";

interface Props {
  exercise: Exercise;
  onClose: () => void;
}

export function ExerciseInfoModal({ exercise, onClose }: Props) {
  // Trava scroll do body enquanto modal aberto + ESC pra fechar
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-bg-raised border border-bg-border rounded-t-2xl sm:rounded-card w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com nome + botão fechar */}
        <div className="sticky top-0 bg-bg-raised border-b border-bg-border px-4 py-3 flex justify-between items-baseline gap-3">
          <h2 className="font-serif text-lg text-nude break-words">{exercise.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted text-xl flex-shrink-0 leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-muted text-xs uppercase tracking-wider">
            {exercise.category} · {exercise.difficulty}
          </p>

          <ExerciseMediaBlock name={exercise.name} gifPath={exercise.gifPath} frames={exercise.frames} videoUrl={exercise.videoUrl} />

          <section>
            <h3 className="text-nude-warm font-medium mb-1">Como fazer</h3>
            {exercise.steps?.length ? (
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                {exercise.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            ) : <p className="text-sm">{exercise.description}</p>}
          </section>

          <section>
            <h3 className="text-nude-warm font-medium mb-1">Erros comuns</h3>
            <ul className="space-y-1 text-sm list-disc pl-5">
              {exercise.commonMistakes.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </section>

          {exercise.proTips && exercise.proTips.length > 0 && (
            <section>
              <h3 className="text-nude-warm font-medium mb-1">Dicas pra maximizar</h3>
              <ul className="space-y-1 text-sm list-disc pl-5">
                {exercise.proTips.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>
          )}

          {exercise.equipment.length > 0 && (
            <section>
              <h3 className="text-nude-warm font-medium mb-1">Equipamento</h3>
              <p className="text-sm">{exercise.equipment.join(", ")}</p>
            </section>
          )}

          {exercise.easierVariation && (
            <section>
              <h3 className="text-nude-warm font-medium mb-1">Se for muito difícil</h3>
              <p className="text-sm">{exercise.easierVariation}</p>
            </section>
          )}

          {exercise.harderVariation && (
            <section>
              <h3 className="text-nude-warm font-medium mb-1">Se ficar fácil demais</h3>
              <p className="text-sm">{exercise.harderVariation}</p>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

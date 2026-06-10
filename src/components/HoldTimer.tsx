import { useEffect, useRef, useState } from "react";

interface Props {
  targetSec?: number;
  onStop?: (elapsedSec: number) => void;
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function HoldTimer({ targetSec, onStop }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const buzzed = useRef(false);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => {
        if (ref.current) clearInterval(ref.current);
      };
    }
  }, [running]);

  useEffect(() => {
    if (targetSec && elapsed >= targetSec && !buzzed.current) {
      buzzed.current = true;
      if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
    }
  }, [elapsed, targetSec]);

  const reached = targetSec ? elapsed >= targetSec : false;

  function handleZerar() {
    setRunning(false);
    onStop?.(elapsed);
    setElapsed(0);
    buzzed.current = false;
  }

  return (
    <div className="card text-center space-y-2">
      <div className="text-3xl tabular-nums">{fmt(elapsed)}</div>
      {targetSec && (
        <div className="text-xs text-muted">
          alvo {fmt(targetSec)}{reached ? " · alvo atingido ✅" : ""}
        </div>
      )}
      <div className="flex gap-2 justify-center">
        {!running ? (
          <button
            type="button"
            className="px-3 py-1 rounded-pill bg-wine-light"
            onClick={() => setRunning(true)}
          >
            Iniciar
          </button>
        ) : (
          <button
            type="button"
            className="px-3 py-1 rounded-pill bg-wine-light"
            onClick={() => setRunning(false)}
          >
            Pausar
          </button>
        )}
        <button
          type="button"
          className="px-3 py-1 rounded-pill bg-bg-deep"
          onClick={handleZerar}
        >
          Zerar
        </button>
      </div>
    </div>
  );
}

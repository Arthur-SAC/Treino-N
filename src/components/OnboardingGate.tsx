import { type ReactNode, useEffect, useState } from "react";
import { seedDatabase } from "../lib/seed";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    seedDatabase()
      .then(() => setReady(true))
      .catch((err) => {
        console.error("seedDatabase falhou", err);
        setReady(true); // degrada com elegância — deixa o app renderizar
      });
  }, []);
  if (!ready) return <div className="p-8 text-center text-muted">Carregando…</div>;
  return <>{children}</>;
}

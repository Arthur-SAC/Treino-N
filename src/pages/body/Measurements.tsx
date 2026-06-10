import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Measurement } from "../../lib/db";
import { MeasurementForm } from "../../components/MeasurementForm";
import { MeasurementChart } from "../../components/MeasurementChart";
import { formatCm, formatDateBR } from "../../lib/format";

function calculateWhr(waist: number, hip: number): number {
  return waist / hip;
}

export function Measurements() {
  const items = useLiveQuery(() => db.measurements.orderBy("date").reverse().toArray(), []);
  const [selectedMetric, setSelectedMetric] = useState<keyof Measurement>("waistCm");

  async function handleSave(m: Omit<Measurement, "id">) {
    await db.measurements.add(m as Measurement);
  }

  const metricOptions: Array<{ key: keyof Measurement; label: string }> = [
    { key: "waistCm", label: "Cintura" },
    { key: "hipCm", label: "Quadril" },
    { key: "thighLeftCm", label: "Coxa E" },
    { key: "armCm", label: "Braço" },
    { key: "weightKg", label: "Peso" },
  ];

  const metricData = items
    ?.filter((m) => typeof m[selectedMetric] === "number")
    .map((m) => ({ date: m.date, value: m[selectedMetric] as number }))
    .reverse() ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino/progressao" className="text-muted text-sm">&larr; Progresso</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Medidas</h1>
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Nova medida</h2>
        <MeasurementForm onSubmit={handleSave} />
      </div>

      {metricData.length > 0 && (
        <div className="card mb-4">
          <h2 className="text-nude-warm font-medium mb-3">Evolução de uma medida</h2>
          <div className="overflow-x-auto -mx-4 px-4 mb-3">
            <div className="flex gap-2 w-max">
              {metricOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedMetric(opt.key)}
                  className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                    selectedMetric === opt.key ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <MeasurementChart data={metricData} />
        </div>
      )}

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Histórico</h2>
      {!items?.length && (
        <p className="text-muted text-sm py-4 text-center">Sem medidas ainda. Adicione a primeira acima.</p>
      )}
      <div className="space-y-2">
        {items?.map((m) => {
          const whr = m.waistCm && m.hipCm ? calculateWhr(m.waistCm, m.hipCm) : null;
          return (
            <div key={m.id} className="card">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-nude-warm">{formatDateBR(new Date(m.date))}</span>
                {whr !== null && (
                  <span className="text-muted text-xs">WHR {whr.toFixed(2)}</span>
                )}
              </div>
              <div className="text-sm text-muted grid grid-cols-2 gap-x-3">
                {m.waistCm !== undefined && <span>Cintura: {formatCm(m.waistCm)}</span>}
                {m.hipCm !== undefined && <span>Quadril: {formatCm(m.hipCm)}</span>}
                {m.thighLeftCm !== undefined && <span>Coxa E: {formatCm(m.thighLeftCm)}</span>}
                {m.armCm !== undefined && <span>Braço: {formatCm(m.armCm)}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

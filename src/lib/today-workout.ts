export interface DayInfo {
  kind: "forca" | "cardio" | "mobilidade" | "folga";
  templateId: string | null;
  label: string;
}

const MAP: Record<number, DayInfo> = {
  0: { kind: "folga", templateId: null, label: "Folga · descanso" },
  1: { kind: "forca", templateId: "forca-a", label: "Força A · Puxar & Ombro" },
  2: { kind: "cardio", templateId: "cardio-ter", label: "Cardio (HIIT na corda)" },
  3: { kind: "forca", templateId: "forca-b", label: "Força B · Perna & Glúteo" },
  4: { kind: "mobilidade", templateId: "mobilidade-qui", label: "Mobilidade" },
  5: { kind: "forca", templateId: "forca-c", label: "Força C · Empurrar & Parada de Mão" },
  6: { kind: "cardio", templateId: "cardio-sab", label: "Cardio leve (corda + caminhada)" },
};

export function describeDay(dayOfWeek: number): DayInfo {
  return MAP[dayOfWeek] ?? MAP[0];
}

import { describe, it, expect } from "vitest";
import { describeDay } from "../../src/lib/today-workout";

describe("describeDay", () => {
  it("dia de folga (domingo)", () => {
    expect(describeDay(0)).toEqual({ kind: "folga", templateId: null, label: "Folga · descanso" });
  });
  it("dia de força mapeia o template", () => {
    expect(describeDay(1)).toEqual({ kind: "forca", templateId: "forca-a", label: "Força A · Puxar & Ombro" });
    expect(describeDay(3)).toEqual({ kind: "forca", templateId: "forca-b", label: "Força B · Perna & Glúteo" });
    expect(describeDay(5)).toEqual({ kind: "forca", templateId: "forca-c", label: "Força C · Empurrar & Parada de Mão" });
  });
  it("cardio e mobilidade", () => {
    expect(describeDay(2).kind).toBe("cardio");
    expect(describeDay(4).kind).toBe("mobilidade");
    expect(describeDay(6).kind).toBe("cardio");
  });
});

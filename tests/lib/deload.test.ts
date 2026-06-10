import { describe, it, expect } from "vitest";
import { weeksBetween, isDeloadDue } from "../../src/lib/deload";

describe("deload", () => {
  it("conta semanas inteiras entre datas", () => {
    expect(weeksBetween("2026-01-01", "2026-01-01")).toBe(0);
    expect(weeksBetween("2026-01-01", "2026-01-15")).toBe(2);
  });
  it("deload vence a partir de 6 semanas e ainda não notificado nesse ciclo", () => {
    expect(isDeloadDue({ startISO: "2026-01-01", todayISO: "2026-02-12", lastDeloadNotifyISO: "" })).toBe(true); // 6 sem
    expect(isDeloadDue({ startISO: "2026-01-01", todayISO: "2026-01-29", lastDeloadNotifyISO: "" })).toBe(false); // 4 sem
    expect(isDeloadDue({ startISO: "2026-01-01", todayISO: "2026-02-12", lastDeloadNotifyISO: "2026-02-10" })).toBe(false);
  });
});

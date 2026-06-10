import { describe, it, expect } from "vitest";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";

describe("settings helpers", () => {
  it("setSetting + getSetting round-trip para workoutReminderTime", async () => {
    await setSetting("workoutReminderTime", "09:30");
    expect(await getSetting("workoutReminderTime")).toBe("09:30");
  });

  it("getSetting retorna default notificationsEnabled = true se chave não existir", async () => {
    expect(await getSetting("notificationsEnabled")).toBe(true);
  });

  it("getSetting retorna default workoutReminderTime = 08:00 se chave não existir", async () => {
    expect(await getSetting("workoutReminderTime")).toBe("08:00");
  });

  it("aceita objeto quietHours", async () => {
    await setSetting("quietHours", { from: "22:00", to: "07:00" });
    expect(await getSetting("quietHours")).toEqual({ from: "22:00", to: "07:00" });
  });
});

// Type-only test: Settings keys are constrained
// @ts-expect-error invalid key
() => setSetting("invalidKey", "x");

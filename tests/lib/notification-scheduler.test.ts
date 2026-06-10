import { it, expect, vi, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { db } from "../../src/lib/db";
import { setSetting } from "../../src/lib/settings-helpers";
import { tick } from "../../src/lib/notification-scheduler";

beforeEach(async () => { await db.settings.clear(); });

it("notifica o treino do dia uma vez, no horário", async () => {
  const spy = vi.fn();
  vi.stubGlobal("Notification", class { static permission = "granted"; constructor() { spy(); } });
  await setSetting("notificationsEnabled", true);
  await setSetting("workoutReminderTime", "08:00");
  // segunda-feira 08:30
  const monday0830 = new Date("2026-06-08T08:30:00");
  await tick(monday0830);
  await tick(monday0830); // segundo tick no mesmo dia não repete
  expect(spy).toHaveBeenCalledTimes(1);
});

it("notifica deload quando passam ~6 semanas desde o início", async () => {
  const titles: string[] = [];
  vi.stubGlobal("Notification", class {
    static permission = "granted";
    constructor(title: string) { titles.push(title); }
  });
  await setSetting("notificationsEnabled", true);
  await setSetting("workoutReminderTime", "08:00");
  await setSetting("programStartISO", "2026-04-27"); // ~6 semanas antes
  // segunda-feira 08:30, 6 semanas depois
  await tick(new Date("2026-06-08T08:30:00"));
  expect(titles).toContain("Semana de deload");
});

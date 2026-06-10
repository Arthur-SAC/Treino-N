import { db } from "./db";

export interface Settings {
  seedVersion: number;
  notificationsEnabled: boolean;          // default true
  workoutReminderTime: string;            // "HH:MM", default "08:00"
  quietHours: { from: string; to: string }; // default { from: "22:00", to: "07:00" }
  focusModeUntil: number | null;          // default null
  lastWorkoutReminderAt: string;          // "yyyy-mm-dd", default ""
  programStartISO: string;                // início do programa, default ""
  lastDeloadNotifyAt: string;             // "yyyy-mm-dd", default ""
}

export const DEFAULTS: Settings = {
  seedVersion: 0,
  notificationsEnabled: true,
  workoutReminderTime: "08:00",
  quietHours: { from: "22:00", to: "07:00" },
  focusModeUntil: null,
  lastWorkoutReminderAt: "",
  programStartISO: "",
  lastDeloadNotifyAt: "",
};

export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
  const row = await db.settings.get(key);
  if (row === undefined) return DEFAULTS[key];
  return row.value as Settings[K];
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value });
}

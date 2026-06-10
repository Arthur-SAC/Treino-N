import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import type { Settings } from "../lib/settings-helpers";

const DEFAULTS: Settings = {
  seedVersion: 0,
  notificationsEnabled: true,
  workoutReminderTime: "08:00",
  quietHours: { from: "22:00", to: "07:00" },
  focusModeUntil: null,
  lastWorkoutReminderAt: "",
  programStartISO: "",
  lastDeloadNotifyAt: "",
};

export function useSetting<K extends keyof Settings>(key: K): Settings[K] {
  const row = useLiveQuery(() => db.settings.get(key), [key]);
  if (row === undefined) return DEFAULTS[key];
  return row.value as Settings[K];
}

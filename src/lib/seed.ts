import { db } from "./db";
import { EXERCISES } from "../data/rotina-natalia-seed";
import { WORKOUT_PLAN } from "../data/rotina-natalia-seed";

const SEED_VERSION = 1;

export async function seedDatabase(): Promise<void> {
  const v = await db.settings.get("seedVersion");
  if (((v?.value as number) ?? 0) >= SEED_VERSION) return;
  await db.transaction("rw", db.exercises, db.workoutTemplates, db.settings, async () => {
    for (const ex of EXERCISES) await db.exercises.put(ex);
    for (const tpl of WORKOUT_PLAN) await db.workoutTemplates.put(tpl);
    await db.settings.put({ key: "seedVersion", value: SEED_VERSION });
  });
}

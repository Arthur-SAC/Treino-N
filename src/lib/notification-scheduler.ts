import { shouldNotifyNow, notify, shouldRemindOncePerDay } from "./notifications";
import { getSetting, setSetting } from "./settings-helpers";
import { describeDay } from "./today-workout";
import { isDeloadDue } from "./deload";

let intervalId: ReturnType<typeof setInterval> | null = null;

export async function tick(now = new Date()): Promise<void> {
  const settings = {
    notificationsEnabled: await getSetting("notificationsEnabled"),
    focusModeUntil: await getSetting("focusModeUntil"),
    quietHours: await getSetting("quietHours"),
  };
  if (!shouldNotifyNow(now, settings)) return;

  const todayISO = now.toISOString().slice(0, 10);
  const currentMin = now.getHours() * 60 + now.getMinutes();

  // 1) Lembrete diário do treino do dia
  const reminderTime = await getSetting("workoutReminderTime");
  const [h, m] = reminderTime.split(":").map(Number);
  const last = await getSetting("lastWorkoutReminderAt");
  const day = describeDay(now.getDay());
  if (shouldRemindOncePerDay({ currentMin, targetMin: h * 60 + m, lastNotifiedDate: last, todayISO, done: day.kind === "folga" })) {
    notify("Treino de hoje", day.kind === "folga" ? "Dia de descanso 💆" : `Hoje é ${day.label}`);
    await setSetting("lastWorkoutReminderAt", todayISO);
  }

  // 2) Deload (a cada ~6-8 semanas)
  const startISO = await getSetting("programStartISO");
  const lastDeload = await getSetting("lastDeloadNotifyAt");
  if (isDeloadDue({ startISO, todayISO, lastDeloadNotifyISO: lastDeload })) {
    notify("Semana de deload", "Já são ~6 semanas. Faça uma semana mais leve pra recuperar.");
    await setSetting("lastDeloadNotifyAt", todayISO);
  }
}

export function startScheduler() {
  if (intervalId !== null) return;
  // grava o início do programa na 1ª vez
  void (async () => {
    if (!(await getSetting("programStartISO"))) {
      await setSetting("programStartISO", new Date().toISOString().slice(0, 10));
    }
  })();
  intervalId = setInterval(() => void tick(), 60_000);
}

export function stopScheduler() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

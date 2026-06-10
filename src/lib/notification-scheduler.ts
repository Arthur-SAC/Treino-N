// STUB: This scheduler will be rewritten in Task 4.2.
// The old implementation referenced db.dailyLog and db.practiceLogs which have been
// removed from the enxuto model. Signatures preserved so App.tsx continues to compile.

let intervalId: ReturnType<typeof setInterval> | null = null;

export async function tick(_now = new Date()): Promise<void> {
  // no-op until Task 4.2 rewrites this
}

export function startScheduler() {
  if (intervalId !== null) return;
  intervalId = setInterval(() => void tick(), 60_000);
}

export function stopScheduler() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

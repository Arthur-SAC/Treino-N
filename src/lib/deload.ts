const DAY = 86_400_000;

export function weeksBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00").getTime();
  const to = new Date(toISO + "T00:00:00").getTime();
  return Math.floor((to - from) / (7 * DAY));
}

export function isDeloadDue(opts: { startISO: string; todayISO: string; lastDeloadNotifyISO: string }): boolean {
  if (!opts.startISO) return false;
  const weeks = weeksBetween(opts.startISO, opts.todayISO);
  if (weeks < 6) return false;
  // não notificar de novo se já avisou nas últimas 2 semanas
  if (opts.lastDeloadNotifyISO && weeksBetween(opts.lastDeloadNotifyISO, opts.todayISO) < 2) return false;
  return true;
}

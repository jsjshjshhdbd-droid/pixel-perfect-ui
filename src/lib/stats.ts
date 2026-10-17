type Row = { completed_at: string; lessons: { minutes: number } | null };
export function useStats(progress: Row[]) {
  const week = [0, 0, 0, 0, 0, 0, 0];
  const now = Date.now();
  const days = new Set<string>();
  let minutes = 0;
  for (const r of progress) {
    const d = new Date(r.completed_at);
    minutes += r.lessons?.minutes ?? 0;
    days.add(d.toDateString());
    if (now - d.getTime() < 7 * 864e5) week[(d.getDay() + 6) % 7] += 1;
  }
  const max = Math.max(1, ...week);
  let streak = 0;
  for (let i = 0; days.has(new Date(now - i * 864e5).toDateString()); i++) streak++;
  return { workouts: progress.length, minutes, streak, week: week.map((v) => Math.round((v / max) * 100)) };
}

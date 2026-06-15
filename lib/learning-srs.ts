/**
 * Minimal SM-2 spaced-repetition scheduler.
 * grade: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
 * Returns the next scheduling state. Weak cards (low grade) come back fast.
 */
export interface SrState {
  ease: number;
  intervalDays: number;
  repetitions: number;
}

export function schedule(prev: SrState, grade: 0 | 1 | 2 | 3): SrState & { dueAt: string } {
  let { ease, intervalDays, repetitions } = prev;

  if (grade === 0) {
    // Failed — reset, resurface within the same session-ish window.
    repetitions = 0;
    intervalDays = 0;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * ease);

    // Adjust ease (clamped). q maps 1..3 -> SM-2's 3..5 range.
    const q = grade + 2;
    ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }

  const due = new Date();
  if (intervalDays === 0) {
    due.setMinutes(due.getMinutes() + 10); // 10 min for "again"
  } else {
    due.setDate(due.getDate() + intervalDays);
  }

  return { ease, intervalDays, repetitions, dueAt: due.toISOString() };
}

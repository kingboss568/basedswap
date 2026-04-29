// =====================================================
// BasedSwap Quest System
// =====================================================
// Local-only points and streak tracking, keyed by wallet address.
// Stored in localStorage. For production with a real leaderboard,
// replace with a Vercel KV / Supabase backend (see /api routes idea).

const STORAGE_PREFIX = "basedswap_quest_v1_";

export type ActivityEntry = {
  type: "checkin" | "swap" | "streak_bonus";
  points: number;
  timestamp: number; // ms epoch
  meta?: {
    tokenIn?: string;
    tokenOut?: string;
    amountIn?: string;
    txHash?: string;
  };
};

export type QuestData = {
  totalPoints: number;
  swapCount: number;
  lastCheckIn: number; // ms epoch, 0 if never
  checkInStreak: number; // consecutive days
  history: ActivityEntry[];
  // Stored separately so we can compute "today already claimed?"
  lastCheckInDay: string; // YYYY-MM-DD in user's timezone
};

const POINTS = {
  CHECKIN: 10,
  SWAP_BASE: 5,
  STREAK_BONUS_PER_DAY: 5,
  STREAK_BONUS_CAP: 50,
} as const;

const EMPTY: QuestData = {
  totalPoints: 0,
  swapCount: 0,
  lastCheckIn: 0,
  checkInStreak: 0,
  history: [],
  lastCheckInDay: "",
};

function key(address: string): string {
  return STORAGE_PREFIX + address.toLowerCase();
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadQuestData(address: string | undefined): QuestData {
  if (!address || typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(key(address));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function saveQuestData(address: string, data: QuestData): void {
  if (typeof window === "undefined") return;
  try {
    // Trim history to last 50 entries to keep localStorage small
    const trimmed = { ...data, history: data.history.slice(0, 50) };
    localStorage.setItem(key(address), JSON.stringify(trimmed));
  } catch {
    // localStorage full or disabled — silently ignore
  }
}

// Whether the user can claim today's check-in.
export function canCheckInToday(data: QuestData): boolean {
  return data.lastCheckInDay !== todayString();
}

// Perform daily check-in. Returns updated data (or null if already claimed today).
export function performCheckIn(address: string, data: QuestData): QuestData | null {
  if (!canCheckInToday(data)) return null;

  const today = todayString();
  const yesterday = yesterdayString();

  // Did we check in yesterday? If yes, streak continues. Otherwise reset.
  const newStreak = data.lastCheckInDay === yesterday ? data.checkInStreak + 1 : 1;

  const streakBonus = Math.min(
    Math.max(newStreak - 1, 0) * POINTS.STREAK_BONUS_PER_DAY,
    POINTS.STREAK_BONUS_CAP
  );
  const earned = POINTS.CHECKIN + streakBonus;
  const now = Date.now();

  const entries: ActivityEntry[] = [
    { type: "checkin", points: POINTS.CHECKIN, timestamp: now },
  ];
  if (streakBonus > 0) {
    entries.push({ type: "streak_bonus", points: streakBonus, timestamp: now });
  }

  const updated: QuestData = {
    ...data,
    totalPoints: data.totalPoints + earned,
    lastCheckIn: now,
    lastCheckInDay: today,
    checkInStreak: newStreak,
    history: [...entries, ...data.history],
  };

  saveQuestData(address, updated);
  return updated;
}

// Record a successful swap.
export function recordSwap(
  address: string,
  data: QuestData,
  meta: { tokenIn: string; tokenOut: string; amountIn: string; txHash: string }
): QuestData {
  const earned = POINTS.SWAP_BASE;
  const now = Date.now();
  const entry: ActivityEntry = { type: "swap", points: earned, timestamp: now, meta };

  const updated: QuestData = {
    ...data,
    totalPoints: data.totalPoints + earned,
    swapCount: data.swapCount + 1,
    history: [entry, ...data.history],
  };

  saveQuestData(address, updated);
  return updated;
}

// Compute today's potential check-in reward (for showing in UI before claim)
export function previewCheckInReward(data: QuestData): number {
  if (!canCheckInToday(data)) return 0;
  const yesterday = yesterdayString();
  const newStreak = data.lastCheckInDay === yesterday ? data.checkInStreak + 1 : 1;
  const streakBonus = Math.min(
    Math.max(newStreak - 1, 0) * POINTS.STREAK_BONUS_PER_DAY,
    POINTS.STREAK_BONUS_CAP
  );
  return POINTS.CHECKIN + streakBonus;
}

export const POINT_VALUES = POINTS;

// In-memory slot lock: key = `${activityId}-${unitNumber}-${date}-${startTime}`, value = { lockedAt, userId }
const lockMap = new Map<string, { lockedAt: number; userId: string }>();
const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const acquireLock = (key: string, userId: string): boolean => {
  cleanExpiredLocks();
  const existing = lockMap.get(key);
  if (existing && Date.now() - existing.lockedAt < LOCK_TTL_MS) {
    return existing.userId === userId; // same user can re-lock
  }
  lockMap.set(key, { lockedAt: Date.now(), userId });
  return true;
};

export const releaseLock = (key: string): void => {
  lockMap.delete(key);
};

export const isLocked = (key: string, excludeUserId?: string): boolean => {
  cleanExpiredLocks();
  const existing = lockMap.get(key);
  if (!existing) return false;
  if (excludeUserId && existing.userId === excludeUserId) return false;
  return Date.now() - existing.lockedAt < LOCK_TTL_MS;
};

const cleanExpiredLocks = (): void => {
  const now = Date.now();
  for (const [key, val] of lockMap.entries()) {
    if (now - val.lockedAt >= LOCK_TTL_MS) lockMap.delete(key);
  }
};

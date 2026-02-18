/**
 * Simple time-based opacity helper for island snakes.
 * Uses created_at to compute a linear fade to ISLAND_MIN_OPACITY.
 */
const ISLAND_MIN_OPACITY = 0.25;

export function calculateOpacityIsland(createdAt: string): number {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const secondsPassed = (now - createdTime) / 1000;

  const fadeSeconds = 8;
  if (secondsPassed >= fadeSeconds) return ISLAND_MIN_OPACITY;

  const progress = secondsPassed / fadeSeconds;
  return 1 - progress * (1 - ISLAND_MIN_OPACITY);
}

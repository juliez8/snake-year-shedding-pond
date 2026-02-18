/** Minimum opacity for island snakes (faded but still visible) */
const ISLAND_MIN_OPACITY = 0.25;

/**
 * Calculate opacity for island snakes - fades over 8 seconds for instant gratification
 */
export function calculateOpacityIsland(createdAt: string): number {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const secondsPassed = (now - createdTime) / 1000;

  const fadeSeconds = 8;
  if (secondsPassed >= fadeSeconds) return ISLAND_MIN_OPACITY;

  const progress = secondsPassed / fadeSeconds;
  return 1 - progress * (1 - ISLAND_MIN_OPACITY);
}

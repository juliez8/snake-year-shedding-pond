/** Minimum opacity for island snakes (faded but still visible) */
const ISLAND_MIN_OPACITY = 0.25;

/**
 * Calculate opacity for island snakes - fades over 10 seconds for instant gratification
 */
// export function calculateOpacityIsland(createdAt: string): number {
//   const createdTime = new Date(createdAt).getTime();
//   const now = Date.now();
//   const secondsPassed = (now - createdTime) / 1000;

//   const fadeSeconds = 10;
//   if (secondsPassed >= fadeSeconds) return ISLAND_MIN_OPACITY;

//   const progress = secondsPassed / fadeSeconds;
//   return 1 - progress * (1 - ISLAND_MIN_OPACITY);
// }

/**
 * Calculate opacity based on time elapsed (legacy - used for gallery: full opacity)
 * Gallery snakes are always shown at full opacity (pre-faded, preserved)
 */
export function calculateOpacity(_createdAt: string): number {
  return 1;
}

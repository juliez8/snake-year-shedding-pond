/**
 * Calculate opacity based on time elapsed since creation
 * Snakes fade over 8 hours but never fully disappear (min 0.1)
 */
export function calculateOpacity(createdAt: string): number {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const hoursPassed = (now - createdTime) / 3600000; // Convert ms to hours
  
  const fadeHours = 8;
  const opacity = Math.max(1 - (hoursPassed / fadeHours), 0.1);
  
  return opacity;
}

/**
 * Get hours remaining until fully faded
 */
export function getHoursRemaining(createdAt: string): number {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const hoursPassed = (now - createdTime) / 3600000;
  
  const fadeHours = 8;
  return Math.max(fadeHours - hoursPassed, 0);
}

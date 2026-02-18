/**
 * Random, non-overlapping pond position generator.
 */
export type Position = {
  position_x: number;
  position_y: number;
};

const MIN_DISTANCE = 0.18;
const MAX_ATTEMPTS = 200;

function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

/** True if (x, y) is closer than MIN_DISTANCE to any existing snake. */
export function overlapsExisting(
  x: number,
  y: number,
  existingSnakes: Position[]
): boolean {
  return existingSnakes.some((snake) =>
    distance(x, y, snake.position_x, snake.position_y) < MIN_DISTANCE
  );
}

/**
 * Pick a random pond position that avoids overlap with existing snakes.
 * Returns found: false if no valid spot after MAX_ATTEMPTS.
 */
export function generateRandomPosition(
  existingSnakes: Position[]
): { x: number; y: number; found: boolean } {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const x = Math.random() * 0.8 + 0.1;
    const y = Math.random() * 0.8 + 0.1;

    if (!overlapsExisting(x, y, existingSnakes)) {
      return { x, y, found: true };
    }
  }

  return {
    x: Math.random() * 0.8 + 0.1,
    y: Math.random() * 0.8 + 0.1,
    found: false,
  };
}

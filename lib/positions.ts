type Position = {
  position_x: number;
  position_y: number;
};

const MIN_DISTANCE = 0.18;
const MAX_ATTEMPTS = 20;

function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function generateRandomPosition(
  existingSnakes: Position[]
) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const x = Math.random() * 0.8 + 0.1;
    const y = Math.random() * 0.8 + 0.1;

    const overlaps = existingSnakes.some((snake) =>
      distance(x, y, snake.position_x, snake.position_y) < MIN_DISTANCE
    );

    if (!overlaps) {
      return { x, y };
    }
  }

  return {
    x: Math.random() * 0.8 + 0.1,
    y: Math.random() * 0.8 + 0.1,
  };
}

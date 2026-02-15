import { DrawingData } from '@/types/snake';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_STROKES = 100;
const MAX_TOTAL_POINTS = 20000;
const MAX_CANVAS_DIMENSION = 1000;

export function validateSnakeGeometry(drawing: DrawingData): ValidationResult {

  if (!drawing.strokes || !Array.isArray(drawing.strokes) || drawing.strokes.length === 0) {
    return { valid: false, error: 'Give your snake a little more slither.' };
  }

  // Upper-bound checks to prevent oversized payloads
  if (drawing.strokes.length > MAX_STROKES) {
    return { valid: false, error: 'Drawing has too many strokes.' };
  }

  if (
    typeof drawing.width !== 'number' || typeof drawing.height !== 'number' ||
    drawing.width <= 0 || drawing.height <= 0 ||
    drawing.width > MAX_CANVAS_DIMENSION || drawing.height > MAX_CANVAS_DIMENSION
  ) {
    return { valid: false, error: 'Invalid drawing dimensions.' };
  }

  let totalPoints = 0;
  for (const stroke of drawing.strokes) {
    if (!stroke.points || !Array.isArray(stroke.points)) {
      return { valid: false, error: 'Invalid stroke data.' };
    }
    totalPoints += stroke.points.length;
  }

  if (totalPoints < 6) {
    return { valid: false, error: 'Give your snake a little more slither.' };
  }

  if (totalPoints > MAX_TOTAL_POINTS) {
    return { valid: false, error: 'Drawing is too complex.' };
  }

  return { valid: true };
}

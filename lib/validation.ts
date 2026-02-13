import { DrawingData } from '@/types/snake';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateSnakeGeometry(drawing: DrawingData): ValidationResult {

  if (!drawing.strokes || drawing.strokes.length === 0) {
    return { valid: false, error: 'Give your snake a little more slither.' };
  }

  const totalPoints = drawing.strokes.reduce(
    (sum, stroke) => sum + stroke.points.length,
    0
  );

  if (totalPoints < 6) {
    return { valid: false, error: 'Give your snake a little more slither.' };
  }

  return { valid: true };
}

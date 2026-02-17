import { DrawingData } from '@/types/snake';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_STROKES = 100;
const MAX_TOTAL_POINTS = 20000;
const MAX_CANVAS_DIMENSION = 1000;
const MAX_MESSAGE_LENGTH = 140;

// Only allow valid hex color codes (3, 4, 6, or 8 digit)
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * Validate that a value is a finite number within the given range.
 */
function isFiniteInRange(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

/**
 * Deeply validate snake drawing geometry and data integrity.
 * Prevents malicious payloads, non-numeric coordinates, and unsafe color strings.
 */
export function validateSnakeGeometry(drawing: DrawingData): ValidationResult {
  if (!drawing || typeof drawing !== 'object') {
    return { valid: false, error: 'Invalid drawing data.' };
  }

  if (!drawing.strokes || !Array.isArray(drawing.strokes) || drawing.strokes.length === 0) {
    return { valid: false, error: 'Give your snake a little more slither.' };
  }

  if (drawing.strokes.length > MAX_STROKES) {
    return { valid: false, error: 'Drawing has too many strokes.' };
  }

  if (!isFiniteInRange(drawing.width, 1, MAX_CANVAS_DIMENSION) ||
      !isFiniteInRange(drawing.height, 1, MAX_CANVAS_DIMENSION)) {
    return { valid: false, error: 'Invalid drawing dimensions.' };
  }

  let totalPoints = 0;

  for (const stroke of drawing.strokes) {
    if (!stroke || typeof stroke !== 'object') {
      return { valid: false, error: 'Invalid stroke data.' };
    }

    // Validate color is a safe hex string — blocks CSS injection via color values
    if (typeof stroke.color !== 'string' || !HEX_COLOR_REGEX.test(stroke.color)) {
      return { valid: false, error: 'Invalid stroke color.' };
    }

    if (!stroke.points || !Array.isArray(stroke.points)) {
      return { valid: false, error: 'Invalid stroke data.' };
    }

    for (const point of stroke.points) {
      if (!point || typeof point !== 'object') {
        return { valid: false, error: 'Invalid point data.' };
      }

      // Validate that coordinates are finite numbers within canvas bounds
      // This prevents NaN, Infinity, and out-of-range values
      if (!isFiniteInRange(point.x, -50, MAX_CANVAS_DIMENSION + 50) ||
          !isFiniteInRange(point.y, -50, MAX_CANVAS_DIMENSION + 50)) {
        return { valid: false, error: 'Invalid point coordinates.' };
      }
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

/**
 * Sanitize and validate user message input.
 * Strips control characters, zero-width characters, and excessive whitespace.
 * Returns the cleaned message or an error.
 */
export function sanitizeMessage(raw: unknown): { message: string } | { error: string } {
  if (!raw || typeof raw !== 'string') {
    return { error: 'Message is required.' };
  }

  // Strip control characters (except newlines/tabs), zero-width characters, and bidirectional overrides
  const cleaned = raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars (keep \t \n \r)
    .replace(/[\u200B-\u200F\u2028-\u202F\u2060\uFEFF]/g, '') // zero-width + bidi
    .replace(/\r\n/g, '\n') // normalize line endings
    .replace(/\n{3,}/g, '\n\n') // collapse excessive newlines
    .trim();

  if (cleaned.length === 0) {
    return { error: 'Message cannot be empty.' };
  }

  if (cleaned.length > MAX_MESSAGE_LENGTH) {
    return { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less.` };
  }

  return { message: cleaned };
}

import { DrawingData, Point } from '@/types/snake';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Calculate distance between two points
function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate total stroke length
function calculateTotalStrokeLength(drawing: DrawingData): number {
  let totalLength = 0;
  
  for (const stroke of drawing.strokes) {
    for (let i = 1; i < stroke.points.length; i++) {
      totalLength += distance(stroke.points[i - 1], stroke.points[i]);
    }
  }
  
  return totalLength;
}

// Calculate bounding box of all strokes
function calculateBoundingBox(drawing: DrawingData): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  
  for (const stroke of drawing.strokes) {
    for (const point of stroke.points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
  }
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Soft validation to discourage non-snake drawings
 * without being overly restrictive
 */
export function validateSnakeGeometry(drawing: DrawingData): ValidationResult {
  // Must have at least one stroke
  if (!drawing.strokes || drawing.strokes.length === 0) {
    return {
      valid: false,
      error: 'Your snake needs a little more slither.',
    };
  }
  
  // Must have some points
  const totalPoints = drawing.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
  if (totalPoints < 10) {
    return {
      valid: false,
      error: 'Your snake needs a little more slither.',
    };
  }
  
  // Calculate total stroke length
  const totalLength = calculateTotalStrokeLength(drawing);
  const minStrokeLength = 100; // Minimum total length
  
  if (totalLength < minStrokeLength) {
    return {
      valid: false,
      error: 'Your snake needs a little more slither.',
    };
  }
  
  // Calculate bounding box
  const bbox = calculateBoundingBox(drawing);
  
  // Minimum width threshold
  const minWidth = 50;
  if (bbox.width < minWidth) {
    return {
      valid: false,
      error: 'Your snake needs a little more slither.',
    };
  }
  
  // Minimum area threshold
  const minArea = 2000;
  const area = bbox.width * bbox.height;
  if (area < minArea) {
    return {
      valid: false,
      error: 'Your snake needs a little more slither.',
    };
  }
  
  // Aspect ratio check - must be elongated
  const aspectRatio = bbox.width / bbox.height;
  const inverseAspectRatio = bbox.height / bbox.width;
  const minAspectRatio = 1.5;
  
  // Either width/height > 1.5 OR height/width > 1.5
  if (aspectRatio < minAspectRatio && inverseAspectRatio < minAspectRatio) {
    return {
      valid: false,
      error: 'Your snake needs a little more slither.',
    };
  }
  
  return { valid: true };
}

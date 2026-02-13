// Core data types for snake drawings

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  color: string;
  points: Point[];
}

export interface DrawingData {
  strokes: Stroke[];
  width: number;
  height: number;
}

export interface Snake {
  id: string;
  drawing_data: DrawingData;
  message: string;
  created_at: string;
  location: 'island' | 'gallery';
  position_x: number;
  position_y: number;
}

export interface SnakeSubmission {
  drawing_data: DrawingData;
  message: string;
}

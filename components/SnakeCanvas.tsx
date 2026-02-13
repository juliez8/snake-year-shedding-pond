'use client';

import { useRef, useEffect, useState } from 'react';
import { Stroke, Point, DrawingData } from '@/types/snake';

interface SnakeCanvasProps {
  width?: number;
  height?: number;
  selectedColor: string;
  onDrawingChange: (drawing: DrawingData) => void;
  clearTrigger?: number;
}

const BRUSH_WIDTH = 8;

export default function SnakeCanvas({
  width = 340,
  height = 340,
  selectedColor,
  onDrawingChange,
  clearTrigger = 0,
}: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Setup canvas with proper DPI scaling for crisp rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Set actual canvas size (with DPI scaling)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set display size (CSS pixels)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context to match DPI
    ctx.scale(dpr, dpr);

    // Set rendering quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, [width, height]);

  // Clear canvas
  useEffect(() => {
    if (clearTrigger > 0) {
      setStrokes([]);
      setCurrentStroke([]);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
        }
      }
    }
  }, [clearTrigger, width, height]);

  // Notify parent of drawing changes
  useEffect(() => {
    onDrawingChange({ strokes, width, height });
  }, [strokes, width, height, onDrawingChange]);

  // Redraw all strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = BRUSH_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.stroke();
    });
  }, [strokes, width, height]);

  // Get coordinates in canvas space (NOT display space)
  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    // Get client coordinates
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Convert to canvas coordinates (accounting for CSS scaling)
    const x = (clientX - rect.left) * (width / rect.width);
    const y = (clientY - rect.top) * (height / rect.height);

    return { x, y };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getPoint(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentStroke([point]);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getPoint(e);
    if (!point) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const last = currentStroke[currentStroke.length - 1];

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = BRUSH_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    setCurrentStroke([...currentStroke, point]);
  };

  const stop = () => {
    if (isDrawing && currentStroke.length > 1) {
      setStrokes([...strokes, { color: selectedColor, points: currentStroke }]);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border-2 border-gray-200 bg-white shadow-inner">
      <canvas
        ref={canvasRef}
        className="block w-full h-auto cursor-crosshair touch-none"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={stop}
      />
    </div>
  );
}

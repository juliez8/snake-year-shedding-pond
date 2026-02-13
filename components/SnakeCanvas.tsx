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

  // 🔥 High DPI fix (crisp canvas, no blur)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }, [width, height]);

  // Clear
  useEffect(() => {
    if (clearTrigger > 0) {
      setStrokes([]);
      setCurrentStroke([]);
      const ctx = canvasRef.current?.getContext('2d');
      ctx?.clearRect(0, 0, width, height);
    }
  }, [clearTrigger, width, height]);

  useEffect(() => {
    onDrawingChange({ strokes, width, height });
  }, [strokes, width, height, onDrawingChange]);

  // Redraw strokes
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

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

  const getPoint = (e: any): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const start = (e: any) => {
    e.preventDefault();
    const point = getPoint(e);
    if (!point) return;
    setIsDrawing(true);
    setCurrentStroke([point]);
  };

  const move = (e: any) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getPoint(e);
    if (!point) return;

    const ctx = canvasRef.current?.getContext('2d');
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
    <div className="w-full max-w-[340px] mx-auto overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-inner">
      <canvas
        ref={canvasRef}
        className="block"
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
